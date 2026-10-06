from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, JsonType


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(50), unique=True)
    kind: Mapped[str] = mapped_column(String(30))
    company: Mapped[str] = mapped_column(String(150))
    location: Mapped[str] = mapped_column(String(150))
    role: Mapped[dict] = mapped_column(JsonType)
    period: Mapped[dict] = mapped_column(JsonType)
    highlights: Mapped[list] = mapped_column(JsonType)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
