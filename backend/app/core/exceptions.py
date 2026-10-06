"""Domain exceptions.

WHY: services must not know about HTTP. They raise these, and the routers
translate them to status codes, keeping the layers decoupled.
"""


class DomainError(Exception):
    """Base class for all business-rule errors."""


class NotFoundError(DomainError):
    """The requested record does not exist."""


class RateLimitExceededError(DomainError):
    """Too many requests; carries how many seconds the client must wait."""

    def __init__(self, retry_after: int) -> None:
        super().__init__("Rate limit exceeded")
        self.retry_after = retry_after
