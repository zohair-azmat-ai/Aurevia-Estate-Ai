"""
Follow-up schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Channel, FollowUpStatus
from app.schemas.common.base import ORMModel


class FollowUpBase(BaseModel):
    lead_id: str
    channel: Channel
    message_template: str
    scheduled_at: datetime
    executed_at: datetime | None = None
    status: FollowUpStatus = FollowUpStatus.PENDING
    attempt_count: int = 0
    error_message: str | None = None
    next_action: str | None = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpRead(FollowUpBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class FollowUpListResponse(BaseModel):
    items: list[FollowUpRead]
    total: int
