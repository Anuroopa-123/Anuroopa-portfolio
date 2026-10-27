"""Schemas for the Portfolio AI Chat Assistant."""
from typing import Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=30)
    language: Literal["en", "ta"] = "en"


class ChatResponse(BaseModel):
    reply: str
    suggested_questions: list[str] = Field(default_factory=list)
    has_api_key: bool = True
