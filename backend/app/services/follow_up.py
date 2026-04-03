"""
Follow-up scheduling service.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.follow_up import FollowUp
from app.models.enums import Channel, FollowUpStatus
from app.schemas.follow_up.schemas import FollowUpCreate


class FollowUpService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def schedule(
        self,
        lead_id: str,
        channel: Channel,
        message_template: str,
        scheduled_at: datetime | None = None,
        next_action: str | None = None,
    ) -> FollowUp:
        scheduled_for = scheduled_at or self.calculate_next_follow_up_time()
        follow_up = FollowUp(
            **FollowUpCreate(
                lead_id=lead_id,
                channel=channel,
                message_template=message_template,
                scheduled_at=scheduled_for,
                next_action=next_action,
            ).model_dump()
        )
        self.db.add(follow_up)
        await self.db.flush()
        await self.db.refresh(follow_up)
        return follow_up

    async def execute(self, follow_up_id: str) -> FollowUp | None:
        follow_up = await self.get_follow_up(follow_up_id)
        if follow_up is None:
            return None
        follow_up.status = FollowUpStatus.EXECUTED
        follow_up.executed_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(follow_up)
        return follow_up

    async def mark_overdue(self) -> list[FollowUp]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(FollowUp).where(
                FollowUp.status == FollowUpStatus.PENDING,
                FollowUp.scheduled_at < now,
            )
        )
        items = list(result.scalars().all())
        return items

    async def get_follow_up(self, follow_up_id: str) -> FollowUp | None:
        result = await self.db.execute(select(FollowUp).where(FollowUp.id == follow_up_id))
        return result.scalar_one_or_none()

    async def list_follow_ups(self, skip: int = 0, limit: int = 50) -> tuple[list[FollowUp], int]:
        total = await self.db.scalar(select(func.count()).select_from(FollowUp)) or 0
        result = await self.db.execute(
            select(FollowUp).order_by(FollowUp.scheduled_at.asc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), total

    def calculate_next_follow_up_time(self) -> datetime:
        return datetime.now(timezone.utc) + timedelta(hours=settings.FOLLOW_UP_DEFAULT_DELAY_HOURS)
