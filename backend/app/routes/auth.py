from fastapi import APIRouter, Depends, HTTPException, status
from ..config import settings
from ..db import get_conn
from ..auth import make_token, require_admin
from ..schemas import LoginIn, LoginOut, ChangePasswordIn

router = APIRouter()


def _get_admin_password() -> str:
    """Return admin password from DB override, falling back to env var."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT value FROM config WHERE key = 'admin_password'"
        ).fetchone()
    if row:
        return row["value"]
    return settings.ADMIN_PASSWORD


@router.post("/login", response_model=LoginOut)
def login(body: LoginIn) -> LoginOut:
    code = body.code.strip()
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="empty code")

    if code == _get_admin_password():
        return LoginOut(token=make_token("admin"), role="admin")

    with get_conn() as conn:
        row = conn.execute("SELECT id FROM tokens WHERE value = ?", (code,)).fetchone()

    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid code")

    return LoginOut(token=make_token("visitor", token_id=row["id"]), role="visitor")


@router.put("/password", status_code=200)
def change_password(body: ChangePasswordIn, _: dict = Depends(require_admin)):
    # Validate current password
    current_admin_pw = _get_admin_password()
    if body.current_password != current_admin_pw:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="当前密码不正确"
        )

    # Validate new passwords match
    if body.new_password != body.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="两次输入的新密码不一致"
        )

    # Validate new password differs from current
    if body.new_password == current_admin_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="新密码不能与当前密码相同"
        )

    # Save to DB (upsert)
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO config(key, value) VALUES('admin_password', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (body.new_password,),
        )

    return {"ok": True}
