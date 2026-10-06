from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
from app.db import SessionLocal
from app.models.user import UserModel

settings = get_settings()
security = HTTPBearer(auto_error=False)


def _decode_local(token: str) -> Dict[str, Any]:
    from app.services.jwt_service import decode_token
    try:
        return decode_token(token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token required")
    claims = _decode_local(credentials.credentials)
    db = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == claims.get("sub")).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or missing")
        out = {
            "sub": user.id, "role": user.role, "email": user.email,
            "assigned_port_id": user.assigned_port_id,
            "must_change_password": user.must_change_password,
            "full_name": user.full_name,
        }
        request.state.user_id = user.id
        return out
    finally:
        db.close()


def require_role(allowed_roles: List[str]):
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Allowed roles: {allowed_roles}")
        return user
    return role_checker
