"""Admin use-cases for contact messages."""
from app.core.exceptions import NotFoundError
from app.database.models import ContactMessage
from app.repositories.message_repository import MessageRepository


class AdminService:
    def __init__(self, repo: MessageRepository) -> None:
        self.repo = repo

    def list_messages(self, unread_only: bool, limit: int, offset: int):
        return self.repo.list(unread_only, limit, offset)

    def _get(self, message_id: int) -> ContactMessage:
        msg = self.repo.get(message_id)
        if msg is None:
            raise NotFoundError(f"Message {message_id} not found")
        return msg

    def set_read(self, message_id: int, is_read: bool) -> ContactMessage:
        return self.repo.set_read(self._get(message_id), is_read)

    def delete(self, message_id: int) -> None:
        self.repo.delete(self._get(message_id))
