from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import init_db
from .routes import auth as auth_routes
from .routes import guests as guest_routes
from .routes import tokens as token_routes
from .routes import uploads as upload_routes

app = FastAPI(title="Book of Fate", version="1.0.0")


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(guest_routes.admin_router, prefix="/api/admin/guests", tags=["admin-guests"])
app.include_router(guest_routes.visitor_router, prefix="/api/visitor/guests", tags=["visitor-guests"])
app.include_router(token_routes.router, prefix="/api/admin/tokens", tags=["admin-tokens"])
app.include_router(upload_routes.router, prefix="/api/admin/uploads", tags=["admin-uploads"])


app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")


if settings.static_path.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(settings.static_path / "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            return JSONResponse({"detail": "not found"}, status_code=404)
        candidate = settings.static_path / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        index = settings.static_path / "index.html"
        if index.is_file():
            return FileResponse(index)
        return JSONResponse({"detail": "frontend not built"}, status_code=404)
