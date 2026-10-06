import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


def validate_password_constraints(password: str) -> list[str]:
    errors = []
    if len(password) < 8:
        errors.append("Minimum 8 characters")
    if not any(c.isupper() for c in password):
        errors.append("At least one uppercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("At least one number")
    if not any(not c.isalnum() for c in password):
        errors.append("At least one special character")
    return errors
