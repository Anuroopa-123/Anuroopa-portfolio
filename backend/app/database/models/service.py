from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, JsonType


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(50), unique=True)
    icon: Mapped[str] = mapped_column(String(50))
    title: Mapped[dict] = mapped_column(JsonType)
    description: Mapped[dict] = mapped_column(JsonType)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
