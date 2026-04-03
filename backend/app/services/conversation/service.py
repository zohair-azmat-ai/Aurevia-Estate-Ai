"""
Conversation service implementation.
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation
from app.schemas.conversation.schemas import ConversationCreate


class ConversationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_conversation(self, payload: ConversationCreate) -> Conversation:
        conversation = Conversation(**payload.model_dump())
        self.db.add(conversation)
        await self.db.flush()
        await self.db.refresh(conversation)
        return conversation

    async def get_conversation(self, conversation_id: str) -> Conversation | None:
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()

    async def list_conversations(
        self, skip: int = 0, limit: int = 50
    ) -> tuple[list[Conversation], int]:
        total = await self.db.scalar(select(func.count()).select_from(Conversation)) or 0
        result = await self.db.execute(
            select(Conversation)
            .order_by(Conversation.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total
