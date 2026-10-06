"""Shared FastAPI dependencies (wiring of layers + admin auth + client IP)."""
import secrets
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.database.connection import get_session
from app.repositories.content_repository import ContentRepository
from app.repositories.message_repository import MessageRepository
from app.services.admin_service import AdminService
from app.services.contact_service import ContactService
from app.services.content_service import ContentService

SessionDep = Annotated[Session, Depends(get_session)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


def get_content_service(session: SessionDep) -> ContentService:
    return ContentService(ContentRepository(session))


def get_contact_service(session: SessionDep, settings: SettingsDep) -> ContactService:
    return ContactService(MessageRepository(session), settings)


def get_admin_service(session: SessionDep) -> AdminService:
    return AdminService(MessageRepository(session))


def client_ip(request: Request, settings: SettingsDep) -> str:
    """Real client IP. X-Forwarded-For is spoofable, so only used behind a trusted proxy."""
    if settings.TRUSTED_PROXY:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            first = forwarded.split(",")[0].strip()
            if first:
                return first
    return request.client.host if request.client else "unknown"


def require_admin(
    settings: SettingsDep,
    x_admin_token: Annotated[str | None, Header()] = None,
) -> None:
    """404 when admin is disabled (hides its existence), 401 on a bad token."""
    if not settings.ADMIN_TOKEN:
        raise HTTPException(status_code=404, detail="Not Found")
    # compare_digest avoids timing attacks; bytes so non-ASCII input cannot raise.
    if not x_admin_token or not secrets.compare_digest(
        x_admin_token.encode(), settings.ADMIN_TOKEN.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid or missing admin token")


ContentServiceDep = Annotated[ContentService, Depends(get_content_service)]
ContactServiceDep = Annotated[ContactService, Depends(get_contact_service)]
AdminServiceDep = Annotated[AdminService, Depends(get_admin_service)]
ClientIpDep = Annotated[str, Depends(client_ip)]
