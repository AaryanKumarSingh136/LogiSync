import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.db import Base


class BookingModel(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token_number = Column(String(32), unique=True, nullable=False, index=True)
    port_id = Column(String(32), nullable=False, index=True)
    service_type = Column(String(64), nullable=False, default="general")
    gate_id = Column(String(64), nullable=False)
    dispatcher_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    vehicle_number = Column(String(32), nullable=False)
    vehicle_type = Column(String(64), nullable=True)
    origin_port_id = Column(String(32), nullable=True)
    delivery_destination = Column(String(256), nullable=False)
    reserved_date = Column(String(16), nullable=False)
    reserved_time_start = Column(String(8), nullable=False)
    reserved_time_end = Column(String(8), nullable=True)
    priority_tier = Column(String(16), nullable=False, default="standard")
    status = Column(String(32), nullable=False, default="queued", index=True)
    is_delayed = Column(String(8), nullable=False, default="false")
    status_updated_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    status_updated_at = Column(DateTime, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
