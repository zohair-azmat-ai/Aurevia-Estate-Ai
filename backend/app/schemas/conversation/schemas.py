"""
Conversation schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Channel, ConversationStatus
from app.schemas.common.base import ORMModel


class ConversationBase(BaseModel):
    lead_id: str
    channel: Channel
    status: ConversationStatus = ConversationStatus.OPEN
    external_thread_id: str | None = None
    summary: str | None = None


class ConversationCreate(ConversationBase):
    pass


class ConversationRead(ConversationBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    items: list[ConversationRead]
    total: int
