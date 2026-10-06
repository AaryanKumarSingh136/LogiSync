import hashlib
import random
import structlog
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models.otp import OtpVerificationModel

logger = structlog.get_logger("logisync.otp")
settings = get_settings()


def _hash(code: str, target: str) -> str:
    return hashlib.sha256(f"{code}:{target}:{settings.OTP_PEPPER}".encode()).hexdigest()


def can_send(db: Session, target_value: str) -> bool:
    window = datetime.utcnow() - timedelta(minutes=15)
    count = db.query(OtpVerificationModel).filter(
        OtpVerificationModel.target_value == target_value,
        OtpVerificationModel.created_at >= window,
    ).count()
    return count < settings.OTP_RATE_LIMIT_PER_15MIN


def send_otp(db: Session, target_type: str, target_value: str, purpose: str = "signup") -> dict:
    if not can_send(db, target_value):
        return {"error": "Rate limited. Max 3 OTPs per 15 minutes.", "status": 429}
    code = f"{random.randint(100000, 999999)}"
    rec = OtpVerificationModel(
        target_type=target_type,
        target_value=target_value,
        otp_code_hash=_hash(code, target_value),
        purpose=purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        attempts=0,
        verified=False,
    )
    db.add(rec)
    db.commit()
    # Simulated delivery: log OTP, never fail when provider unconfigured
    logger.info("otp_simulated", target_type=target_type, target_value=target_value, otp=code, purpose=purpose)
    print(f"[OTP simulated] {target_type} {target_value}: {code}")
    return {"dispatched": True, "mode": "simulated", "expires_in_min": settings.OTP_EXPIRE_MINUTES}


def verify_otp(db: Session, target_type: str, target_value: str, code: str) -> dict:
    rec = db.query(OtpVerificationModel).filter(
        OtpVerificationModel.target_type == target_type,
        OtpVerificationModel.target_value == target_value,
        OtpVerificationModel.verified == False,  # noqa: E712
    ).order_by(OtpVerificationModel.created_at.desc()).first()
    if not rec:
        return {"ok": False, "error": "No pending OTP. Request a new code."}
    if datetime.utcnow() > rec.expires_at:
        return {"ok": False, "error": "OTP expired. Request a new code."}
    if rec.attempts >= settings.OTP_MAX_ATTEMPTS:
        return {"ok": False, "error": "Too many attempts. Request a new code."}
    if rec.otp_code_hash != _hash(code, target_value):
        rec.attempts += 1
        db.commit()
        return {"ok": False, "error": "Incorrect OTP."}
    rec.verified = True
    db.commit()
    return {"ok": True}


def is_verified(db: Session, target_type: str, target_value: str, purpose: str = "signup") -> bool:
    window = datetime.utcnow() - timedelta(minutes=30)
    return db.query(OtpVerificationModel).filter(
        OtpVerificationModel.target_type == target_type,
        OtpVerificationModel.target_value == target_value,
        OtpVerificationModel.purpose == purpose,
        OtpVerificationModel.verified == True,  # noqa: E712
        OtpVerificationModel.created_at >= window,
    ).first() is not None
