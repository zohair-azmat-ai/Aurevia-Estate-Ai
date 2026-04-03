"""
Analytics schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Channel, EventType
from app.schemas.common.base import ORMModel


class AnalyticsEventRead(ORMModel):
    id: str
    lead_id: str | None
    event_type: EventType
    channel: Channel | None
    payload: str | None
    created_at: datetime
    updated_at: datetime


class AnalyticsEventListResponse(BaseModel):
    items: list[AnalyticsEventRead]
    total: int


class ChannelCount(BaseModel):
    channel: Channel
    count: int


class AnalyticsSummaryRead(BaseModel):
    total_leads: int
    new_leads_7d: int
    conversations_today: int
    avg_response_time_seconds: int
    escalation_rate: float
    top_channels: list[ChannelCount]
