"""
Settings schemas.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorkspaceSettings(BaseModel):
    workspace_name: str = "Aurevia Estate AI"
    primary_market: str = "Dubai, UAE"
    timezone: str = "Asia/Dubai"
    brand_tone: str = "Luxury, assured, and concise"


class AISettings(BaseModel):
    primary_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    confidence_threshold: float = 0.82
    temperature: float = 0.3
    max_tokens: int = 1024


class AutomationSettings(BaseModel):
    auto_follow_ups: bool = True
    escalation_guardrails: str = "strict"
    follow_up_delay_hours: int = 24
    enable_whatsapp: bool = True
    enable_email: bool = True


class NotificationSettings(BaseModel):
    priority_alerts: bool = True
    daily_summary_time: str = "07:30 GST"
    digest_email: str = "ops@aurevia.ai"


class SecuritySettings(BaseModel):
    admin_access_policy: str = "Role-based"
    audit_logging: bool = True
    session_timeout_minutes: int = 60
    mfa_required: bool = False


class SettingsRead(BaseModel):
    workspace: WorkspaceSettings
    ai: AISettings
    automation: AutomationSettings
    notifications: NotificationSettings
    security: SecuritySettings
    updated_at: datetime | None = None


class SettingsUpdate(BaseModel):
    workspace: WorkspaceSettings | None = None
    ai: AISettings | None = None
    automation: AutomationSettings | None = None
    notifications: NotificationSettings | None = None
    security: SecuritySettings | None = None


class SettingCategoryRead(BaseModel):
    category: str
    payload: dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime | None = None
