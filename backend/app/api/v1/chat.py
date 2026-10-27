"""AI Portfolio Chatbot endpoint."""
from fastapi import APIRouter

from app.api.deps import AIServiceDep
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_portfolio_ai(
    req: ChatRequest,
    service: AIServiceDep,
) -> ChatResponse:
    """Interactively answer questions about Anuroopa's projects, experience and skills.

    Powered dynamically by OpenAI using the portfolio knowledge base.
    """
    return await service.chat(messages=req.messages, language=req.language)
