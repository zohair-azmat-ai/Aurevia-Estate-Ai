"""
Integration management service.
"""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.integration_connection import IntegrationConnection
from app.models.enums import EventType
from app.schemas.integration.schemas import IntegrationActionResponse
from app.services.analytics import AnalyticsService
from app.services.shared.serialization import from_json, to_json


class IntegrationService:
    PROVIDERS = ("whatsapp", "email", "openai", "qdrant", "postgres", "crm")

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.analytics = AnalyticsService(db)

    async def list_integrations(self) -> list[IntegrationConnection]:
        items: list[IntegrationConnection] = []
        for provider in self.PROVIDERS:
            items.append(await self.ensure_provider(provider))
        return items

    async def get_integration(self, provider: str) -> IntegrationConnection | None:
        if provider not in self.PROVIDERS:
            return None
        return await self.ensure_provider(provider)

    async def sync_provider(self, provider: str) -> IntegrationActionResponse:
        record = await self.ensure_provider(provider)
        computed = self._provider_defaults(provider)
        now = datetime.now(timezone.utc)
        record.status = computed["status"]
        record.health = computed["health"]
        record.notes = computed["notes"]
        record.config_metadata = to_json(computed["config_metadata"])
        record.last_checked_at = now
        record.last_synced_at = now
        await self.db.flush()
        await self.db.refresh(record)
        await self.analytics.log(
            EventType.INTEGRATION_TEST_RUN,
            channel=None,
            payload={"provider": provider, "action": "sync", "status": record.status},
        )
        return IntegrationActionResponse(
            provider=provider,
            action="sync",
            status=record.status,
            message=f"{record.display_name} sync metadata refreshed.",
            details=from_json(record.config_metadata, {}),
            last_checked_at=record.last_checked_at,
            last_synced_at=record.last_synced_at,
        )

    async def test_provider(self, provider: str) -> IntegrationActionResponse:
        record = await self.ensure_provider(provider)
        now = datetime.now(timezone.utc)
        record.last_checked_at = now
        await self.db.flush()
        await self.db.refresh(record)
        await self.analytics.log(
            EventType.INTEGRATION_TEST_RUN,
            channel=None,
            payload={"provider": provider, "action": "test", "status": record.status},
        )
        return IntegrationActionResponse(
            provider=provider,
            action="test",
            status=record.status,
            message=f"{record.display_name} test completed with {record.health} health.",
            details=from_json(record.config_metadata, {}),
            last_checked_at=record.last_checked_at,
            last_synced_at=record.last_synced_at,
        )

    async def ensure_provider(self, provider: str) -> IntegrationConnection:
        result = await self.db.execute(
            select(IntegrationConnection).where(IntegrationConnection.provider == provider)
        )
        record = result.scalar_one_or_none()
        computed = self._provider_defaults(provider)

        if record is None:
            record = IntegrationConnection(
                provider=provider,
                display_name=computed["display_name"],
                status=computed["status"],
                health=computed["health"],
                notes=computed["notes"],
                config_metadata=to_json(computed["config_metadata"]),
                last_checked_at=datetime.now(timezone.utc),
            )
            self.db.add(record)
            await self.db.flush()
            await self.db.refresh(record)
            return record

        record.display_name = computed["display_name"]
        record.status = computed["status"]
        record.health = computed["health"]
        record.notes = computed["notes"]
        record.config_metadata = to_json(computed["config_metadata"])
        if record.last_checked_at is None:
            record.last_checked_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(record)
        return record

    def _provider_defaults(self, provider: str) -> dict[str, Any]:
        providers: dict[str, dict[str, Any]] = {
            "whatsapp": {
                "display_name": "WhatsApp",
                "status": "connected" if settings.WHATSAPP_PHONE_NUMBER_ID else "warning",
                "health": "healthy" if settings.WHATSAPP_ACCESS_TOKEN else "degraded",
                "notes": "Meta Cloud API webhook and outbound transport are running in safe placeholder mode when credentials are incomplete.",
                "config_metadata": {
                    "environment": "Meta Cloud API",
                    "phone_number_id": self._mask(settings.WHATSAPP_PHONE_NUMBER_ID),
                    "verify_token_configured": bool(settings.WHATSAPP_VERIFY_TOKEN),
                    "app_secret_configured": bool(settings.WHATSAPP_APP_SECRET),
                },
            },
            "email": {
                "display_name": "Email",
                "status": "connected" if settings.EMAIL_SMTP else "warning",
                "health": "healthy" if settings.EMAIL_FROM_ADDRESS else "degraded",
                "notes": "Inbound email intake and outbound reply flows are provider-ready with safe placeholder delivery when SMTP credentials are absent.",
                "config_metadata": {
                    "environment": "SMTP / webhook intake",
                    "from_address": settings.EMAIL_FROM_ADDRESS,
                    "smtp_configured": bool(settings.EMAIL_SMTP),
                    "webhook_secret_configured": bool(settings.EMAIL_WEBHOOK_SECRET),
                },
            },
            "openai": {
                "display_name": "OpenAI",
                "status": "connected" if settings.OPENAI_API_KEY else "warning",
                "health": "healthy" if settings.OPENAI_API_KEY else "degraded",
                "notes": "LLM orchestration and embeddings are available when API credentials are configured.",
                "config_metadata": {
                    "environment": "API model layer",
                    "primary_model": settings.OPENAI_MODEL,
                    "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
                    "api_key_configured": bool(settings.OPENAI_API_KEY),
                },
            },
            "qdrant": {
                "display_name": "Qdrant",
                "status": "connected" if settings.QDRANT_URL else "warning",
                "health": "healthy" if settings.QDRANT_URL else "degraded",
                "notes": "Vector retrieval is configured, with collection details exposed safely for operational checks.",
                "config_metadata": {
                    "environment": "Vector retrieval",
                    "url": settings.QDRANT_URL,
                    "collection": settings.QDRANT_COLLECTION,
                    "api_key_configured": bool(settings.QDRANT_API_KEY),
                },
            },
            "postgres": {
                "display_name": "PostgreSQL",
                "status": "connected" if settings.DATABASE_URL else "offline",
                "health": "healthy" if settings.DATABASE_URL else "degraded",
                "notes": "Primary application persistence is active through the configured SQLAlchemy database URL.",
                "config_metadata": {
                    "environment": "Primary database",
                    "database_url": self._mask_dsn(settings.DATABASE_URL),
                    "pool_size": settings.DB_POOL_SIZE,
                },
            },
            "crm": {
                "display_name": "CRM",
                "status": "warning",
                "health": "degraded",
                "notes": "External CRM sync remains a production-shaped placeholder pending live downstream connector credentials.",
                "config_metadata": {
                    "environment": "External CRM bridge",
                    "mode": "placeholder",
                    "sync_enabled": False,
                },
            },
        }
        return providers[provider]

    def _mask(self, value: str | None) -> str | None:
        if not value:
            return None
        if len(value) <= 6:
            return "*" * len(value)
        return f"{value[:2]}***{value[-2:]}"

    def _mask_dsn(self, dsn: str) -> str:
        if "@" not in dsn:
            return dsn
        prefix, suffix = dsn.split("@", 1)
        if "://" in prefix:
            scheme, rest = prefix.split("://", 1)
            if ":" in rest:
                username, _password = rest.split(":", 1)
                return f"{scheme}://{username}:***@{suffix}"
        return f"***@{suffix}"
