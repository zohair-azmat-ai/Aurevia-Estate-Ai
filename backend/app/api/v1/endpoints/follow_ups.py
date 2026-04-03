"""
Follow-up API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.follow_up.schemas import FollowUpCreate, FollowUpListResponse, FollowUpRead
from app.services.follow_up import FollowUpService

router = APIRouter()


@router.get("", response_model=FollowUpListResponse, summary="List scheduled follow-ups")
async def list_follow_ups(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = FollowUpService(db)
    items, total = await service.list_follow_ups(skip, limit)
    return FollowUpListResponse(
        items=[FollowUpRead.model_validate(item) for item in items],
        total=total,
    )


@router.post("", response_model=FollowUpRead, status_code=status.HTTP_201_CREATED, summary="Create follow-up")
async def create_follow_up(payload: FollowUpCreate, db: AsyncSession = Depends(get_db)):
    service = FollowUpService(db)
    follow_up = await service.schedule(
        lead_id=payload.lead_id,
        channel=payload.channel,
        message_template=payload.message_template,
        scheduled_at=payload.scheduled_at,
        next_action=payload.next_action,
    )
    return FollowUpRead.model_validate(follow_up)


@router.post("/{follow_up_id}/execute", response_model=FollowUpRead, summary="Manually trigger a follow-up")
async def execute_follow_up(follow_up_id: str, db: AsyncSession = Depends(get_db)):
    service = FollowUpService(db)
    follow_up = await service.execute(follow_up_id)
    if follow_up is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found")
    return FollowUpRead.model_validate(follow_up)
