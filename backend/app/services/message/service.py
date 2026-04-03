"""
Message service implementation.
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.schemas.message.schemas import MessageCreate


class MessageService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def store_message(self, payload: MessageCreate) -> Message:
        message = Message(**payload.model_dump())
        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)
        return message

    async def list_messages(
        self, conversation_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[list[Message], int]:
        total = (
            await self.db.scalar(
                select(func.count())
                .select_from(Message)
                .where(Message.conversation_id == conversation_id)
            )
            or 0
        )
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total
