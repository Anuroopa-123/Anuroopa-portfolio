"""Application settings, loaded from environment variables / a .env file.

WHY: one typed place for configuration (12-factor style), so nothing else
reads os.environ directly and secrets never live in code.
"""
from functools import lru_cache
from typing import Literal
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Portfolio API"
    APP_ENV: Literal["development", "production"] = "development"
    DEBUG: bool = False

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "portfolio"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    # When set (tests do this) it replaces the URL built from the DB_* values.
    DATABASE_URL_OVERRIDE: str = ""

    FRONTEND_URL: str = "http://localhost:4200"
    # Empty means "admin API disabled".
    ADMIN_TOKEN: str = ""
    IP_HASH_SALT: str = "dev-only-salt-change-me"
    CONTACT_RATE_LIMIT_PER_HOUR: int = 3
    # Only trust X-Forwarded-For when we really sit behind our own proxy,
    # otherwise any client could fake its IP and dodge the rate limit.
    TRUSTED_PROXY: bool = False

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL_OVERRIDE:
            return self.DATABASE_URL_OVERRIDE
        # quote_plus so characters like @ : / in the password cannot break the URL.
        auth = quote_plus(self.DB_USER)
        if self.DB_PASSWORD:
            auth += ":" + quote_plus(self.DB_PASSWORD)
        return f"postgresql+psycopg://{auth}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


@lru_cache
def get_settings() -> Settings:
    """Cached so the env is parsed once; tests can mutate the returned object."""
    return Settings()
