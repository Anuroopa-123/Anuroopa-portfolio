from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.deps import AdminServiceDep, require_admin
from app.core.exceptions import NotFoundError
from app.schemas.contact import MessageListOut, MessageOut, MessageUpdate

# Every route in this router needs the admin token.
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/messages", response_model=MessageListOut)
def list_messages(
    service: AdminServiceDep,
    unread_only: bool = False,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> MessageListOut:
    total, items = service.list_messages(unread_only, limit, offset)
    return MessageListOut(total=total, items=[MessageOut.model_validate(i) for i in items])


@router.patch("/messages/{message_id}", response_model=MessageOut)
def update_message(message_id: int, body: MessageUpdate, service: AdminServiceDep) -> MessageOut:
    try:
        return MessageOut.model_validate(service.set_read(message_id, body.is_read))
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, service: AdminServiceDep) -> Response:
    try:
        service.delete(message_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
