"""FastAPI application factory and wiring."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.deps import SessionDep
from app.api.v1 import admin, contact, content
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

    # CORS: only the frontend origin, no cookies, only the verbs/headers we use.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-Admin-Token"],
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        """Stop browsers from guessing content types (MIME sniffing)."""
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.get("/health", tags=["health"])
    def health(session: SessionDep) -> dict[str, str]:
        """Liveness + DB check."""
        session.execute(text("SELECT 1"))
        return {"status": "ok"}

    app.include_router(content.router, prefix="/api/v1")
    app.include_router(contact.router, prefix="/api/v1")
    app.include_router(admin.router, prefix="/api/v1")
    return app


app = create_app()
