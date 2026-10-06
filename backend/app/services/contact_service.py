"""Contact form logic: rate limit, honeypot, privacy-friendly storage."""
import hashlib

from app.core.config import Settings
from app.core.exceptions import RateLimitExceededError
from app.core.rate_limit import contact_limiter
from app.repositories.message_repository import MessageRepository
from app.schemas.contact import ContactIn

SUCCESS_MESSAGE = "Thanks, your message was sent. I will reply soon."


class ContactService:
    def __init__(self, repo: MessageRepository, settings: Settings) -> None:
        self.repo = repo
        self.settings = settings

    def hash_ip(self, ip: str) -> str:
        """sha256(ip + salt): lets us spot repeat senders without storing the IP."""
        return hashlib.sha256((ip + self.settings.IP_HASH_SALT).encode()).hexdigest()

    def submit(self, data: ContactIn, ip: str, user_agent: str | None) -> str:
        # Rate limit first so bots filling the honeypot are throttled too.
        retry = contact_limiter.hit(ip, self.settings.CONTACT_RATE_LIMIT_PER_HOUR, 3600)
        if retry is not None:
            raise RateLimitExceededError(retry)

        # Honeypot: pretend success, store nothing, so bots learn nothing.
        if data.website and data.website.strip():
            return SUCCESS_MESSAGE

        self.repo.add(
            name=data.name,
            email=str(data.email),
            project_type=data.project_type,
            message=data.message,
            ip_hash=self.hash_ip(ip),
            user_agent=(user_agent or "")[:255] or None,
        )
        return SUCCESS_MESSAGE
