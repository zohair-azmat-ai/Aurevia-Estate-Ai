"""
Settings persistence service.
"""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings as app_config
from app.models.app_setting import AppSetting
from app.models.enums import EventType
from app.schemas.settings.schemas import (
    AISettings,
    AutomationSettings,
    NotificationSettings,
    SecuritySettings,
    SettingsRead,
    SettingsUpdate,
    WorkspaceSettings,
)
from app.services.analytics import AnalyticsService
from app.services.shared.serialization import from_json, to_json


class SettingsService:
    CATEGORIES = ("workspace", "ai", "automation", "notifications", "security")

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.analytics = AnalyticsService(db)

    async def get_all(self) -> SettingsRead:
        workspace_row = await self._ensure_category("workspace")
        ai_row = await self._ensure_category("ai")
        automation_row = await self._ensure_category("automation")
        notifications_row = await self._ensure_category("notifications")
        security_row = await self._ensure_category("security")

        updated_at = max(
            [
                workspace_row.updated_at,
                ai_row.updated_at,
                automation_row.updated_at,
                notifications_row.updated_at,
                security_row.updated_at,
            ]
        )

        return SettingsRead(
            workspace=WorkspaceSettings(**from_json(workspace_row.payload, {})),
            ai=AISettings(**from_json(ai_row.payload, {})),
            automation=AutomationSettings(**from_json(automation_row.payload, {})),
            notifications=NotificationSettings(**from_json(notifications_row.payload, {})),
            security=SecuritySettings(**from_json(security_row.payload, {})),
            updated_at=updated_at,
        )

    async def get_category(self, category: str) -> dict[str, Any] | None:
        if category not in self.CATEGORIES:
            return None
        row = await self._ensure_category(category)
        return {
            "category": category,
            "payload": from_json(row.payload, {}),
            "updated_at": row.updated_at,
        }

    async def update_all(self, payload: SettingsUpdate) -> SettingsRead:
        data = payload.model_dump(exclude_none=True)
        changed_categories: list[str] = []
        for category, category_payload in data.items():
            await self._write_category(category, category_payload)
            changed_categories.append(category)

        if changed_categories:
            await self.analytics.log(
                EventType.SETTINGS_UPDATED,
                payload={"categories": changed_categories},
            )

        return await self.get_all()

    async def update_category(self, category: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        if category not in self.CATEGORIES:
            return None
        await self._write_category(category, payload)
        await self.analytics.log(
            EventType.SETTINGS_UPDATED,
            payload={"categories": [category]},
        )
        return await self.get_category(category)

    async def _ensure_category(self, category: str) -> AppSetting:
        result = await self.db.execute(select(AppSetting).where(AppSetting.category == category))
        row = result.scalar_one_or_none()
        if row is not None:
            return row

        defaults = self._default_payload(category)
        row = AppSetting(category=category, payload=to_json(defaults) or "{}")
        self.db.add(row)
        await self.db.flush()
        await self.db.refresh(row)
        return row

    async def _write_category(self, category: str, payload: dict[str, Any]) -> AppSetting:
        row = await self._ensure_category(category)
        row.payload = to_json(payload) or "{}"
        row.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(row)
        return row

    def _default_payload(self, category: str) -> dict[str, Any]:
        defaults = {
            "workspace": WorkspaceSettings().model_dump(),
            "ai": AISettings(
                primary_model=app_config.OPENAI_MODEL,
                embedding_model=app_config.OPENAI_EMBEDDING_MODEL,
                temperature=app_config.OPENAI_TEMPERATURE,
                max_tokens=app_config.OPENAI_MAX_TOKENS,
            ).model_dump(),
            "automation": AutomationSettings(
                follow_up_delay_hours=app_config.FOLLOW_UP_DEFAULT_DELAY_HOURS,
            ).model_dump(),
            "notifications": NotificationSettings().model_dump(),
            "security": SecuritySettings().model_dump(),
        }
        return defaults[category]
