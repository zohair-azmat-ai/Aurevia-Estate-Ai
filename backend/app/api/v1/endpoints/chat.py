"""
Chat agent endpoint.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.chat.schemas import ChatRequest, ChatResponse
from app.services.chat import ChatAgentService

router = APIRouter()


@router.post("", response_model=ChatResponse, summary="AI real estate advisor chat")
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    service = ChatAgentService(db)
    return await service.handle_message(payload.message, user_id=payload.user_id)
