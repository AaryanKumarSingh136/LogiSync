import re
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db import get_db
from app.models.user import UserModel
from app.services import otp_service
from app.services.password import hash_password, verify_password, validate_password_constraints
from app.services.jwt_service import create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth: dispatcher signup + local JWT"])

VEHICLE_RE = re.compile(r"^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$")


class CheckMobileResp(BaseModel):
    available: bool


class SendOtpReq(BaseModel):
    target_type: str  # mobile | email
    target_value: str
    purpose: Optional[str] = "signup"


class VerifyOtpReq(BaseModel):
    target_type: str
    target_value: str
    code: str


class RegisterReq(BaseModel):
    full_name: str
    vehicle_number: str
    vehicle_type: Optional[str] = None
    photo_url: Optional[str] = None
    mobile: str
    email: EmailStr
    password: str
    role: Optional[str] = "dispatcher"


class LoginReq(BaseModel):
    identifier: str  # email or mobile
    password: str


class ChangePasswordReq(BaseModel):
    current_password: str
    new_password: str


@router.get("/check-mobile")
def check_mobile(mobile: str, db: Session = Depends(get_db)):
    exists = db.query(UserModel).filter(UserModel.mobile_number == mobile).first()
    if exists:
        raise HTTPException(status_code=409, detail="This mobile number is already registered. Each number can only be linked to one account.")
    return {"available": True}


@router.post("/send-otp")
def send_otp(req: SendOtpReq, db: Session = Depends(get_db)):
    if req.target_type == "mobile":
        conflict = db.query(UserModel).filter(UserModel.mobile_number == req.target_value).first()
        if conflict:
            raise HTTPException(status_code=409, detail="This mobile number is already registered. Each number can only be linked to one account.")
    res = otp_service.send_otp(db, req.target_type, req.target_value, req.purpose or "signup")
    if "error" in res:
        raise HTTPException(status_code=res.get("status", 400), detail=res["error"])
    return res


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpReq, db: Session = Depends(get_db)):
    res = otp_service.verify_otp(db, req.target_type, req.target_value, req.code)
    if not res.get("ok"):
        raise HTTPException(status_code=400, detail=res["error"])
    return {"verified": True}


VEHICLE_TYPES = {"trailer", "container_truck", "reefer_truck", "flatbed", "tanker"}
# Legacy categories from before the gate-service taxonomy switch — accepted so
# existing dispatcher accounts keep working, but never offered at signup.
LEGACY_VEHICLE_TYPES = {"container_reefer", "bulk", "cargo", "express_mail"}


def _ensure_vehicle_type_column(db: Session):
    try:
        cols = [r[1] for r in db.execute(__import__("sqlalchemy").text("SELECT name FROM pragma_table_info('users')")).fetchall()]
        # fallback for older sqlite: PRAGMA table_info
        if not cols:
            cols = [r[1] for r in db.execute(__import__("sqlalchemy").text("PRAGMA table_info(users)")).fetchall()]
        if "vehicle_type" not in cols:
            db.execute(__import__("sqlalchemy").text("ALTER TABLE users ADD COLUMN vehicle_type VARCHAR(32)"))
            db.commit()
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass


def _normalize_mobile(mobile: str) -> str:
    m = (mobile or "").strip().replace(" ", "").replace("-", "")
    if m.startswith("+91"):
        return m
    if m.startswith("91") and len(m) == 12:
        return f"+{m}"
    digits = "".join(c for c in m if c.isdigit())
    if len(digits) == 10:
        return f"+91{digits}"
    return m if m.startswith("+") else f"+91{digits}"


@router.post("/register", status_code=201)
def register(req: RegisterReq, db: Session = Depends(get_db)):
    # Server-side role lock: only dispatcher may self-register
    if (req.role or "dispatcher") != "dispatcher":
        raise HTTPException(status_code=403, detail="Self-registration is dispatcher-only.")
    if not VEHICLE_RE.match((req.vehicle_number or "").replace(" ", "").upper()):
        raise HTTPException(status_code=422, detail="Invalid vehicle number format.")
    if req.vehicle_type and req.vehicle_type not in VEHICLE_TYPES and req.vehicle_type not in LEGACY_VEHICLE_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid vehicle_type. Choose {sorted(VEHICLE_TYPES)}")
    mobile = _normalize_mobile(req.mobile)
    if db.query(UserModel).filter(or_(UserModel.email == req.email, UserModel.mobile_number == mobile)).first():
        raise HTTPException(status_code=409, detail="Email or mobile already registered.")
    # OTP verification removed per product decision — direct creation.
    errs = validate_password_constraints(req.password)
    if errs:
        raise HTTPException(status_code=422, detail={"password_errors": errs})
    _ensure_vehicle_type_column(db)
    user = UserModel(
        role="dispatcher", full_name=req.full_name, email=str(req.email),
        email_verified=False, mobile_number=mobile, mobile_verified=False,
        password_hash=hash_password(req.password),
        photo_url=req.photo_url, vehicle_number=req.vehicle_number.replace(" ", "").upper(),
        vehicle_type=req.vehicle_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.role, user.assigned_port_id)
    return {"access_token": token, "token_type": "Bearer", "role": user.role, "user_id": user.id}


@router.post("/login")
def login(req: LoginReq, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(or_(UserModel.email == req.identifier, UserModel.mobile_number == req.identifier)).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated.")
    token = create_access_token(user.id, user.role, user.assigned_port_id)
    return {"access_token": token, "token_type": "Bearer", "role": user.role,
            "assigned_port_id": user.assigned_port_id,
            "must_change_password": user.must_change_password, "user_id": user.id}


@router.get("/me")
def me(user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(UserModel).filter(UserModel.id == user["sub"]).first()
    return {"id": row.id, "role": row.role, "full_name": row.full_name, "email": row.email,
            "mobile_number": row.mobile_number, "photo_url": row.photo_url,
            "vehicle_number": row.vehicle_number, "vehicle_type": getattr(row, "vehicle_type", None),
            "assigned_port_id": row.assigned_port_id,
            "must_change_password": row.must_change_password}


@router.post("/change-password")
def change_password(req: ChangePasswordReq, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(UserModel).filter(UserModel.id == user["sub"]).first()
    if not verify_password(req.current_password, row.password_hash):
        raise HTTPException(status_code=401, detail="Current password incorrect.")
    errs = validate_password_constraints(req.new_password)
    if errs:
        raise HTTPException(status_code=422, detail={"password_errors": errs})
    row.password_hash = hash_password(req.new_password)
    row.must_change_password = False
    db.commit()
    return {"changed": True}
