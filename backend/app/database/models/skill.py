from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, JsonType


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("category", "name", name="uq_skills_category_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(100))
    level: Mapped[str] = mapped_column(String(30))
    note: Mapped[dict] = mapped_column(JsonType)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
