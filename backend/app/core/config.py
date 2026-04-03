"""
Aurevia Estate AI - Application configuration.
"""

from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "Aurevia Estate AI"
    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    JWT_SECRET: str = "change-me-in-production"
    API_PREFIX: str = "/api/v1"

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/aurevia"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False
    ALEMBIC_DATABASE_URL: str | None = None

    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "aurevia_knowledge"
    QDRANT_API_KEY: str | None = None

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_MAX_TOKENS: int = 1024
    OPENAI_TEMPERATURE: float = 0.3

    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.72
    EMBEDDING_DIMENSION: int = 1536

    WHATSAPP_API_KEY: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_APP_SECRET: str = ""
    WHATSAPP_DEFAULT_RECIPIENT: str = ""

    EMAIL_SMTP: str = "smtp://localhost:1025"
    EMAIL_FROM_ADDRESS: str = "noreply@aurevia.ai"
    EMAIL_WEBHOOK_SECRET: str = ""
    EMAIL_IMAP_HOST: str = "imap.gmail.com"
    EMAIL_IMAP_PORT: int = 993
    EMAIL_IMAP_USER: str = ""
    EMAIL_IMAP_PASSWORD: str = ""
    EMAIL_POLL_INTERVAL_SECONDS: int = 60

    ESCALATION_CONFIDENCE_THRESHOLD: float = 0.6
    FOLLOW_UP_DEFAULT_DELAY_HOURS: int = 24
    HIGH_BUDGET_THRESHOLD: int = 5_000_000
    NEGATIVE_SENTIMENT_THRESHOLD: float = -0.4

    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def effective_jwt_secret(self) -> str:
        return self.JWT_SECRET or self.SECRET_KEY

    @property
    def sync_database_url(self) -> str:
        if self.ALEMBIC_DATABASE_URL:
            return self.ALEMBIC_DATABASE_URL
        if self.DATABASE_URL.startswith("postgresql+asyncpg://"):
            return self.DATABASE_URL.replace(
                "postgresql+asyncpg://", "postgresql+psycopg://", 1
            )
        return self.DATABASE_URL


settings = Settings()
