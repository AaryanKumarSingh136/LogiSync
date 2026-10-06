import jwt as pyjwt
from datetime import datetime, timedelta
from app.config import get_settings

settings = get_settings()


def create_access_token(user_id: str, role: str, assigned_port_id: str | None = None) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "assigned_port_id": assigned_port_id,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return pyjwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return pyjwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
