import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from app.db import Base


def _uuid():
    return str(uuid.uuid4())


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    role = Column(String(32), nullable=False, index=True)  # port_admin | fleet_manager | dispatcher
    full_name = Column(String(128), nullable=False)
    email = Column(String(256), unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    mobile_number = Column(String(32), unique=True, nullable=False, index=True)
    mobile_verified = Column(Boolean, default=False, nullable=False)
    password_hash = Column(String(256), nullable=False)
    photo_url = Column(String(512), nullable=True)
    vehicle_number = Column(String(32), nullable=True)
    vehicle_type = Column(String(32), nullable=True)
    assigned_port_id = Column(String(32), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
