"""
Message schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Channel, MessageRole
from app.schemas.common.base import ORMModel


class MessageBase(BaseModel):
    conversation_id: str
    role: MessageRole
    content: str
    channel: Channel
    is_ai_generated: bool = False
    ai_model: str | None = None
    tokens_used: int | None = None


class MessageCreate(MessageBase):
    pass


class MessageRead(MessageBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class MessageListResponse(BaseModel):
    items: list[MessageRead]
    total: int
