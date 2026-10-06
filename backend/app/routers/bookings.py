import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.models.booking import BookingModel
from app.models.user import UserModel
from app.models.status_log import StatusUpdateLogModel
from app.dependencies import get_current_user, require_role
from app.ports import is_valid_port

router = APIRouter(prefix="/bookings", tags=["Bookings"])

VALID_STATUS = {"queued", "in_transit", "at_gate", "loading", "delayed", "completed", "cancelled"}
VALID_TIERS = {"standard", "express", "urgent"}


class CreateBookingReq(BaseModel):
    port_id: str
    service_type: Optional[str] = "general"
    gate_id: str
    vehicle_number: str
    vehicle_type: Optional[str] = None
    origin_port_id: Optional[str] = None
    delivery_destination: str
    reserved_date: str
    reserved_time_start: str
    reserved_time_end: Optional[str] = None
    priority_tier: Optional[str] = "standard"


class StatusReq(BaseModel):
    status: str
    is_delayed: Optional[bool] = None


class RescheduleReq(BaseModel):
    reserved_date: Optional[str] = None
    reserved_time_start: Optional[str] = None
    reserved_time_end: Optional[str] = None
    gate_id: Optional[str] = None


def _serialize(b: BookingModel) -> dict:
    return {c.name: getattr(b, c.name) for c in b.__table__.columns}


@router.post("", status_code=201, dependencies=[Depends(require_role(["dispatcher"]))])
def create_booking(req: CreateBookingReq, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_valid_port(req.port_id):
        raise HTTPException(status_code=400, detail=f"Unknown port {req.port_id}")
    tier = (req.priority_tier or "standard").lower()
    if tier not in VALID_TIERS:
        raise HTTPException(status_code=422, detail=f"Invalid tier. Valid: {VALID_TIERS}")
    token = f"LS-{uuid.uuid4().hex[:8].upper()}"
    b = BookingModel(
        token_number=token, port_id=req.port_id, service_type=req.service_type or "general",
        gate_id=req.gate_id, dispatcher_id=user["sub"], vehicle_number=req.vehicle_number,
        vehicle_type=req.vehicle_type, origin_port_id=req.origin_port_id,
        delivery_destination=req.delivery_destination, reserved_date=req.reserved_date,
        reserved_time_start=req.reserved_time_start, reserved_time_end=req.reserved_time_end,
        priority_tier=tier, status="queued",
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return _serialize(b)


@router.get("/mine")
def my_bookings(user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(BookingModel).filter(BookingModel.dispatcher_id == user["sub"]).order_by(BookingModel.created_at.desc()).all()
    return [_serialize(r) for r in rows]


@router.get("")
def list_bookings(port: Optional[str] = None, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fleet managers are pre-filtered to their assigned port server-side
    if user["role"] == "fleet_manager":
        port = user.get("assigned_port_id")
        if not port:
            raise HTTPException(status_code=403, detail="No assigned port.")
    q = db.query(BookingModel)
    if port:
        q = q.filter(BookingModel.port_id == port)
    return [_serialize(r) for r in q.order_by(BookingModel.created_at.desc()).limit(500).all()]


@router.get("/{booking_id}")
def get_booking(booking_id: str, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    b = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if user["role"] == "dispatcher" and b.dispatcher_id != user["sub"]:
        raise HTTPException(status_code=403, detail="Not your booking.")
    if user["role"] == "fleet_manager" and b.port_id != user.get("assigned_port_id"):
        raise HTTPException(status_code=403, detail="Cross-port access denied.")
    return _serialize(b)


@router.patch("/{booking_id}/status")
def update_status(booking_id: str, req: StatusReq, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    if user["role"] not in ("fleet_manager", "port_admin"):
        raise HTTPException(status_code=403, detail="Only fleet managers can update status.")
    b = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if user["role"] == "fleet_manager" and b.port_id != user.get("assigned_port_id"):
        raise HTTPException(status_code=403, detail="Cross-port access denied.")
    if req.status not in VALID_STATUS:
        raise HTTPException(status_code=422, detail=f"Invalid status. Valid: {VALID_STATUS}")
    old = b.status
    b.status = req.status
    if req.is_delayed is not None:
        b.is_delayed = "true" if req.is_delayed else "false"
    b.status_updated_by = user["sub"]
    b.status_updated_at = datetime.utcnow()
    db.add(StatusUpdateLogModel(booking_id=b.id, old_status=old, new_status=req.status, updated_by=user["sub"]))
    db.commit()
    db.refresh(b)
    # WebSocket push
    try:
        from app.main import ws_manager
        import asyncio
        msg = {"type": "booking_status", "data": {"booking_id": b.id, "token_number": b.token_number,
               "old_status": old, "new_status": b.status, "port_id": b.port_id}}
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(ws_manager.broadcast(msg))
        except Exception:
            pass
    except Exception:
        pass
    return _serialize(b)


def _dispatcher_booking_or_404(db: Session, booking_id: str, user: Dict[str, Any]):
    if user["role"] != "dispatcher":
        raise HTTPException(status_code=403, detail="Only dispatchers can modify their bookings.")
    b = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if b.dispatcher_id != user["sub"]:
        raise HTTPException(status_code=403, detail="Not your booking.")
    if b.status != "queued":
        raise HTTPException(status_code=409, detail="Only queued bookings can be changed.")
    return b


@router.patch("/{booking_id}/schedule")
def reschedule_booking(booking_id: str, req: RescheduleReq, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    b = _dispatcher_booking_or_404(db, booking_id, user)
    if req.reserved_date is not None:
        b.reserved_date = req.reserved_date
    if req.reserved_time_start is not None:
        b.reserved_time_start = req.reserved_time_start
    if req.reserved_time_end is not None:
        b.reserved_time_end = req.reserved_time_end
    if req.gate_id is not None:
        b.gate_id = req.gate_id
    db.commit()
    db.refresh(b)
    return _serialize(b)


@router.delete("/{booking_id}")
def cancel_booking(booking_id: str, user: Dict[str, Any] = Depends(get_current_user), db: Session = Depends(get_db)):
    b = _dispatcher_booking_or_404(db, booking_id, user)
    old = b.status
    b.status = "cancelled"
    b.status_updated_by = user["sub"]
    b.status_updated_at = datetime.utcnow()
    db.add(StatusUpdateLogModel(booking_id=b.id, old_status=old, new_status="cancelled", updated_by=user["sub"]))
    db.commit()
    db.refresh(b)
    try:
        from app.main import ws_manager
        import asyncio
        msg = {"type": "booking_status", "data": {"booking_id": b.id, "token_number": b.token_number,
               "old_status": old, "new_status": b.status, "port_id": b.port_id}}
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(ws_manager.broadcast(msg))
        except Exception:
            pass
    except Exception:
        pass
    return _serialize(b)
