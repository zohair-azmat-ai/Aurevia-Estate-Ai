"""
Escalation API endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.escalation.schemas import EscalationListResponse, EscalationRead
from app.services.escalation import EscalationService

router = APIRouter()


@router.get("", response_model=EscalationListResponse, summary="List escalations")
async def list_escalations(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = EscalationService(db)
    items, total = await service.list_escalations(skip, limit)
    return EscalationListResponse(
        items=[EscalationRead.model_validate(item) for item in items],
        total=total,
    )
