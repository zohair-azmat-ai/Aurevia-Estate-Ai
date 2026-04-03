"""
Conversation API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.conversation.schemas import ConversationCreate, ConversationListResponse, ConversationRead
from app.services.conversation.service import ConversationService

router = APIRouter()


@router.get("", response_model=ConversationListResponse, summary="List conversations")
async def list_conversations(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    items, total = await service.list_conversations(skip, limit)
    return ConversationListResponse(
        items=[ConversationRead.model_validate(item) for item in items],
        total=total,
    )


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED, summary="Create conversation")
async def create_conversation(payload: ConversationCreate, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    conversation = await service.create_conversation(payload)
    return ConversationRead.model_validate(conversation)


@router.get("/{conversation_id}", response_model=ConversationRead, summary="Get conversation thread")
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    conversation = await service.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return ConversationRead.model_validate(conversation)
