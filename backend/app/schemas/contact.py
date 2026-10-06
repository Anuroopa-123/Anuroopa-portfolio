"""Contact form input validation and admin output shapes."""
import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

ProjectType = Literal["fullstack", "frontend", "backend", "database", "ai", "automation", "job", "other"]

# Control characters except tab (\x09) and newline (\x0a), which are legit in a message.
_CTRL = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    project_type: ProjectType
    message: str
    # Honeypot: hidden in the form, humans leave it empty, bots fill it.
    website: str | None = None

    @field_validator("name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        v = _CTRL.sub("", v.replace("\t", " ").replace("\n", " "))
        v = " ".join(v.split())  # collapse whitespace
        if not 2 <= len(v) <= 100:
            raise ValueError("name must be 2-100 characters")
        return v

    @field_validator("message")
    @classmethod
    def _clean_message(cls, v: str) -> str:
        v = _CTRL.sub("", v).strip()
        if not 10 <= len(v) <= 4000:
            raise ValueError("message must be 10-4000 characters")
        return v


class ContactOut(BaseModel):
    message: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    project_type: str
    message: str
    is_read: bool
    created_at: datetime


class MessageListOut(BaseModel):
    total: int
    items: list[MessageOut]


class MessageUpdate(BaseModel):
    is_read: bool
