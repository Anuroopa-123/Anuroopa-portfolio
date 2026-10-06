"""Tiny in-memory sliding-window rate limiter.

WHY: protects the contact form from spam without extra infrastructure.
Limitation (say it in interviews): state is per process, so with several
workers each has its own counter; use Redis if you scale out.
"""
import math
import threading
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str, limit: int, window_seconds: int = 3600) -> int | None:
        """Record an attempt. Returns None if allowed, else seconds to wait."""
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] >= window_seconds:  # drop hits outside the window
                q.popleft()
            if len(q) >= limit:
                return max(1, math.ceil(window_seconds - (now - q[0])))
            q.append(now)
            return None

    def reset(self) -> None:
        """Forget everything (used by tests)."""
        with self._lock:
            self._hits.clear()


contact_limiter = SlidingWindowRateLimiter()
