"""Data access for contact messages."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.models import ContactMessage


class MessageRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, **fields) -> ContactMessage:
        msg = ContactMessage(**fields)
        self.session.add(msg)
        self.session.commit()
        return msg

    def get(self, message_id: int) -> ContactMessage | None:
        return self.session.get(ContactMessage, message_id)

    def list(self, unread_only: bool, limit: int, offset: int) -> tuple[int, list[ContactMessage]]:
        cond = [ContactMessage.is_read.is_(False)] if unread_only else []
        total = self.session.scalar(select(func.count()).select_from(ContactMessage).where(*cond)) or 0
        stmt = (
            select(ContactMessage)
            .where(*cond)
            .order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return total, list(self.session.scalars(stmt))

    def set_read(self, msg: ContactMessage, is_read: bool) -> ContactMessage:
        msg.is_read = is_read
        self.session.commit()
        return msg

    def delete(self, msg: ContactMessage) -> None:
        self.session.delete(msg)
        self.session.commit()
