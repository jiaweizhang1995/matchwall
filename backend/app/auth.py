import time
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from .config import settings

ALGO = "HS256"
bearer = HTTPBearer(auto_error=False)


def make_token(role: str, token_id: Optional[str] = None) -> str:
    now = int(time.time())
    payload = {
        "role": role,
        "iat": now,
        "exp": now + settings.JWT_EXPIRE_DAYS * 86400,
    }
    if token_id:
        payload["token_id"] = token_id
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGO)


def _decode(creds: Optional[HTTPAuthorizationCredentials]) -> dict:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token")
    try:
        return jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[ALGO])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")


def require_admin(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    payload = _decode(creds)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin only")
    return payload


def require_visitor(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    payload = _decode(creds)
    if payload.get("role") != "visitor" or not payload.get("token_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="visitor only")
    return payload
