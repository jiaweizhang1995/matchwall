import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import require_admin, require_visitor
from ..db import get_conn
from ..schemas import GuestIn, GuestOut

admin_router = APIRouter()
visitor_router = APIRouter()


def _row_to_guest(row) -> GuestOut:
    return GuestOut(
        id=row["id"],
        name=row["name"],
        gender=row["gender"],
        age=row["age"],
        height=row["height"],
        education=row["education"],
        job=row["job"],
        city=row["city"],
        intro=row["intro"],
        photo_url=row["photo_url"],
        created_at=row["created_at"],
    )


# ───── Admin ─────

@admin_router.get("", response_model=list[GuestOut])
def list_guests(_=Depends(require_admin)) -> list[GuestOut]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM guests ORDER BY created_at DESC").fetchall()
    return [_row_to_guest(r) for r in rows]


@admin_router.post("", response_model=GuestOut)
def create_guest(body: GuestIn, _=Depends(require_admin)) -> GuestOut:
    gid = uuid.uuid4().hex[:12]
    now = int(time.time() * 1000)
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO guests (id,name,gender,age,height,education,job,city,intro,photo_url,created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (gid, body.name, body.gender, body.age, body.height, body.education,
             body.job, body.city, body.intro, body.photo_url, now),
        )
        row = conn.execute("SELECT * FROM guests WHERE id = ?", (gid,)).fetchone()
    return _row_to_guest(row)


@admin_router.put("/{guest_id}", response_model=GuestOut)
def update_guest(guest_id: str, body: GuestIn, _=Depends(require_admin)) -> GuestOut:
    with get_conn() as conn:
        cur = conn.execute(
            """UPDATE guests
               SET name=?, gender=?, age=?, height=?, education=?, job=?, city=?, intro=?, photo_url=?
               WHERE id=?""",
            (body.name, body.gender, body.age, body.height, body.education,
             body.job, body.city, body.intro, body.photo_url, guest_id),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="guest not found")
        row = conn.execute("SELECT * FROM guests WHERE id = ?", (guest_id,)).fetchone()
    return _row_to_guest(row)


@admin_router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest(guest_id: str, _=Depends(require_admin)) -> None:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM guests WHERE id = ?", (guest_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="guest not found")


# ───── Visitor ─────

def _visitor_guests(conn, token_id: str) -> list:
    t = conn.execute("SELECT scope FROM tokens WHERE id = ?", (token_id,)).fetchone()
    if t is None:
        raise HTTPException(status_code=401, detail="token revoked")
    scope = t["scope"]
    if scope == "all_male":
        return conn.execute(
            "SELECT * FROM guests WHERE gender='male' ORDER BY created_at DESC"
        ).fetchall()
    if scope == "all_female":
        return conn.execute(
            "SELECT * FROM guests WHERE gender='female' ORDER BY created_at DESC"
        ).fetchall()
    return conn.execute(
        """SELECT g.* FROM guests g
           JOIN token_guests tg ON tg.guest_id = g.id
           WHERE tg.token_id = ?
           ORDER BY g.created_at DESC""",
        (token_id,),
    ).fetchall()


@visitor_router.get("", response_model=list[GuestOut])
def visitor_list(payload=Depends(require_visitor)) -> list[GuestOut]:
    with get_conn() as conn:
        rows = _visitor_guests(conn, payload["token_id"])
    return [_row_to_guest(r) for r in rows]


@visitor_router.get("/{guest_id}", response_model=GuestOut)
def visitor_detail(guest_id: str, payload=Depends(require_visitor)) -> GuestOut:
    with get_conn() as conn:
        rows = _visitor_guests(conn, payload["token_id"])
        for r in rows:
            if r["id"] == guest_id:
                return _row_to_guest(r)
    raise HTTPException(status_code=403, detail="not in scope")
