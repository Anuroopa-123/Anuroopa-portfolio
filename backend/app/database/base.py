"""Declarative base and the shared JSON column type."""
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase

# Plain JSON on SQLite (tests), binary JSONB on PostgreSQL (faster, indexable).
JsonType = JSON().with_variant(JSONB(), "postgresql")


class Base(DeclarativeBase):
    pass
