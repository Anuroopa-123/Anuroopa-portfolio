from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, true
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, JsonType


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    categories: Mapped[list] = mapped_column(JsonType)
    status: Mapped[str] = mapped_column(String(30))
    visual: Mapped[str] = mapped_column(String(50))
    # i18n fields look like {"en": "...", "ta": "..."}
    title: Mapped[dict] = mapped_column(JsonType)
    summary: Mapped[dict] = mapped_column(JsonType)
    problem: Mapped[dict] = mapped_column(JsonType)
    solution: Mapped[dict] = mapped_column(JsonType)
    features: Mapped[list] = mapped_column(JsonType)
    stack: Mapped[list] = mapped_column(JsonType)
    github_url: Mapped[str] = mapped_column(String(500), default="", server_default="")
    live_url: Mapped[str] = mapped_column(String(500), default="", server_default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
