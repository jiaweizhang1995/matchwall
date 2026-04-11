import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..auth import require_admin
from ..config import settings
from ..schemas import UploadOut

router = APIRouter()

_ALLOWED_EXT = {"jpg", "jpeg", "png", "webp"}
_MAGIC = {
    b"\xff\xd8\xff": "jpg",
    b"\x89PNG\r\n\x1a\n": "png",
    b"RIFF": "webp",  # followed later by WEBP
}


def _sniff_ext(head: bytes) -> str | None:
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"RIFF") and head[8:12] == b"WEBP":
        return "webp"
    return None


@router.post("", response_model=UploadOut)
async def upload_photo(
    file: UploadFile = File(...),
    _=Depends(require_admin),
) -> UploadOut:
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"max {settings.MAX_UPLOAD_MB}MB")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="empty file")

    ext = _sniff_ext(data[:16])
    if ext is None or ext not in _ALLOWED_EXT:
        raise HTTPException(status_code=415, detail="unsupported image format")

    name = f"{uuid.uuid4().hex}.{ext}"
    path = settings.upload_path / name
    path.write_bytes(data)
    return UploadOut(url=f"/uploads/{name}")
