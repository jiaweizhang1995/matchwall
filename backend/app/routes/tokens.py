import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import require_admin
from ..db import get_conn
from ..schemas import TokenIn, TokenOut

router = APIRouter()


def _load_token(conn, token_id: str) -> TokenOut:
    t = conn.execute("SELECT * FROM tokens WHERE id = ?", (token_id,)).fetchone()
    if t is None:
        raise HTTPException(status_code=404, detail="token not found")
    guest_ids: list[str] = []
    if t["scope"] == "custom":
        guest_ids = [
            r["guest_id"]
            for r in conn.execute(
                "SELECT guest_id FROM token_guests WHERE token_id = ?", (token_id,)
            )
        ]
    return TokenOut(
        id=t["id"], value=t["value"], scope=t["scope"],
        guest_ids=guest_ids, created_at=t["created_at"],
    )


def _write_links(conn, token_id: str, scope: str, guest_ids: list[str]) -> None:
    conn.execute("DELETE FROM token_guests WHERE token_id = ?", (token_id,))
    if scope != "custom" or not guest_ids:
        return
    rows = [(token_id, gid) for gid in guest_ids]
    conn.executemany(
        "INSERT OR IGNORE INTO token_guests (token_id, guest_id) VALUES (?,?)", rows
    )


@router.get("", response_model=list[TokenOut])
def list_tokens(_=Depends(require_admin)) -> list[TokenOut]:
    with get_conn() as conn:
        rows = conn.execute("SELECT id FROM tokens ORDER BY created_at DESC").fetchall()
        return [_load_token(conn, r["id"]) for r in rows]


@router.post("", response_model=TokenOut)
def create_token(body: TokenIn, _=Depends(require_admin)) -> TokenOut:
    value = body.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="empty value")
    if body.scope == "custom" and not body.guest_ids:
        raise HTTPException(status_code=400, detail="custom scope needs guest_ids")

    tid = uuid.uuid4().hex[:12]
    now = int(time.time() * 1000)
    with get_conn() as conn:
        exists = conn.execute("SELECT 1 FROM tokens WHERE value = ?", (value,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="duplicate token value")
        conn.execute(
            "INSERT INTO tokens (id,value,scope,created_at) VALUES (?,?,?,?)",
            (tid, value, body.scope, now),
        )
        _write_links(conn, tid, body.scope, body.guest_ids)
        return _load_token(conn, tid)


@router.put("/{token_id}", response_model=TokenOut)
def update_token(token_id: str, body: TokenIn, _=Depends(require_admin)) -> TokenOut:
    value = body.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="empty value")
    if body.scope == "custom" and not body.guest_ids:
        raise HTTPException(status_code=400, detail="custom scope needs guest_ids")

    with get_conn() as conn:
        dup = conn.execute(
            "SELECT id FROM tokens WHERE value = ? AND id != ?", (value, token_id)
        ).fetchone()
        if dup:
            raise HTTPException(status_code=409, detail="duplicate token value")
        cur = conn.execute(
            "UPDATE tokens SET value = ?, scope = ? WHERE id = ?",
            (value, body.scope, token_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="token not found")
        _write_links(conn, token_id, body.scope, body.guest_ids)
        return _load_token(conn, token_id)


@router.delete("/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_token(token_id: str, _=Depends(require_admin)) -> None:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM tokens WHERE id = ?", (token_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="token not found")
