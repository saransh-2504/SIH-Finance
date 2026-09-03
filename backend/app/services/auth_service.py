"""Authentication helpers — JWT creation/validation and password hashing."""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from ..config import get_settings

settings = get_settings()


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(subject: str, extra: Optional[dict] = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire, **(extra or {})}
    return jwt.encode(payload, settings.auth_secret, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Optional[str]:
    """Return the subject (user id) or None if invalid."""
    try:
        payload = jwt.decode(token, settings.auth_secret, algorithms=[settings.algorithm])
        return str(payload.get("sub"))
    except JWTError:
        return None
