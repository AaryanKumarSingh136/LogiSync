import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime
from app.db import Base


class OtpVerificationModel(Base):
    __tablename__ = "otp_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    target_type = Column(String(16), nullable=False, index=True)  # mobile | email
    target_value = Column(String(256), nullable=False, index=True)
    otp_code_hash = Column(String(256), nullable=False)
    purpose = Column(String(32), nullable=False, default="signup")  # signup | password_reset | change_contact
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
