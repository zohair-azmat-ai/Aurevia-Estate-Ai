"""
Integration schemas.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class IntegrationProviderRead(BaseModel):
    provider: str
    display_name: str
    status: str
    health: str
    notes: str | None = None
    config_metadata: dict[str, Any] = Field(default_factory=dict)
    last_checked_at: datetime | None = None
    last_synced_at: datetime | None = None


class IntegrationListResponse(BaseModel):
    items: list[IntegrationProviderRead]
    total: int


class IntegrationActionResponse(BaseModel):
    provider: str
    action: str
    status: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    last_checked_at: datetime | None = None
    last_synced_at: datetime | None = None


class IntegrationTestSendRequest(BaseModel):
    to: str
    message: str
    subject: str | None = None
