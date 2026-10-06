from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, status

from app.api.deps import ClientIpDep, ContactServiceDep
from app.core.exceptions import RateLimitExceededError
from app.schemas.contact import ContactIn, ContactOut

router = APIRouter(tags=["contact"])


@router.post("/contact", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def send_contact(
    data: ContactIn,
    service: ContactServiceDep,
    ip: ClientIpDep,
    user_agent: Annotated[str | None, Header()] = None,
) -> ContactOut:
    """Receive a contact form message. Router stays thin: logic lives in the service."""
    try:
        message = service.submit(data, ip, user_agent)
    except RateLimitExceededError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many messages. Please try again later.",
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    return ContactOut(message=message)
