"""
Message API endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.message.schemas import MessageCreate, MessageListResponse, MessageRead
from app.services.message.service import MessageService

router = APIRouter()


@router.get("/{conversation_id}", response_model=MessageListResponse, summary="Get messages for a conversation")
async def get_messages(
    conversation_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    service = MessageService(db)
    items, total = await service.list_messages(conversation_id, skip, limit)
    return MessageListResponse(items=[MessageRead.model_validate(item) for item in items], total=total)


@router.post("", response_model=MessageRead, summary="Create message")
async def create_message(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    service = MessageService(db)
    message = await service.store_message(payload)
    return MessageRead.model_validate(message)
