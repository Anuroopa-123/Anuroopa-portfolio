"""Test setup. Env vars MUST be set before importing the app (settings are read at import)."""
import json
import os
from pathlib import Path

_DB_FILE = Path(__file__).resolve().parent / "test_portfolio.db"
os.environ["DATABASE_URL_OVERRIDE"] = f"sqlite:///{_DB_FILE}"
os.environ["FRONTEND_URL"] = "http://localhost:4200"
os.environ["ADMIN_TOKEN"] = ""
os.environ["IP_HASH_SALT"] = "test-salt"
os.environ["CONTACT_RATE_LIMIT_PER_HOUR"] = "3"
os.environ["TRUSTED_PROXY"] = "false"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.rate_limit import contact_limiter  # noqa: E402
from app.database.base import Base  # noqa: E402
from app.database.connection import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402

CONTENT_FILE = Path(__file__).resolve().parents[1] / ".." / "content" / "content.json"


@pytest.fixture(autouse=True)
def _fresh_db():
    """Empty tables and a fresh rate limiter for every test."""
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    contact_limiter.reset()
    yield


@pytest.fixture(scope="session", autouse=True)
def _cleanup_db_file():
    yield
    engine.dispose()
    _DB_FILE.unlink(missing_ok=True)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def content():
    return json.loads(CONTENT_FILE.read_text(encoding="utf-8"))


@pytest.fixture
def seeded(content):
    with SessionLocal() as s:
        seed(s, content)
    return content


@pytest.fixture
def admin_token(monkeypatch):
    """Enable the admin API for one test (settings object is cached, so patch it)."""
    monkeypatch.setattr(get_settings(), "ADMIN_TOKEN", "test-admin-token")
    return "test-admin-token"
