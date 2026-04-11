from fastapi import APIRouter, HTTPException, status
from ..config import settings
from ..db import get_conn
from ..auth import make_token
from ..schemas import LoginIn, LoginOut

router = APIRouter()


@router.post("/login", response_model=LoginOut)
def login(body: LoginIn) -> LoginOut:
    code = body.code.strip()
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="empty code")

    if code == settings.ADMIN_PASSWORD:
        return LoginOut(token=make_token("admin"), role="admin")

    with get_conn() as conn:
        row = conn.execute("SELECT id FROM tokens WHERE value = ?", (code,)).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid code")

    return LoginOut(token=make_token("visitor", token_id=row["id"]), role="visitor")
