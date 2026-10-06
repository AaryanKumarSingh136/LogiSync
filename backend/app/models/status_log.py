import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from datetime import datetime
from app.db import Base


class StatusUpdateLogModel(Base):
    __tablename__ = "status_update_log"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=False, index=True)
    old_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=False)
    updated_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
