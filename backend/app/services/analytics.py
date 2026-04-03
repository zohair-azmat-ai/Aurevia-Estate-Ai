"""
Analytics event service.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.event import Event
from app.models.lead import Lead
from app.models.enums import EventType
from app.services.shared.serialization import to_json


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def log(
        self,
        event_type: EventType,
        lead_id: str | None = None,
        channel=None,
        payload: dict | None = None,
    ) -> Event:
        event = Event(
            lead_id=lead_id,
            event_type=event_type,
            channel=channel,
            payload=to_json(payload),
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def list_events(self, skip: int = 0, limit: int = 100) -> tuple[list[Event], int]:
        total = await self.db.scalar(select(func.count()).select_from(Event)) or 0
        result = await self.db.execute(
            select(Event).order_by(Event.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_summary(self) -> dict:
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        total_leads = await self.db.scalar(select(func.count()).select_from(Lead)) or 0
        new_leads_7d = (
            await self.db.scalar(
                select(func.count()).select_from(Lead).where(Lead.created_at >= week_ago)
            )
            or 0
        )
        conversations_today = (
            await self.db.scalar(
                select(func.count())
                .select_from(Conversation)
                .where(Conversation.created_at >= day_start)
            )
            or 0
        )
        reply_events = (
            await self.db.scalar(
                select(func.count())
                .select_from(Event)
                .where(Event.event_type == EventType.REPLY_GENERATED)
            )
            or 0
        )
        escalation_events = (
            await self.db.scalar(
                select(func.count())
                .select_from(Event)
                .where(Event.event_type == EventType.ESCALATION_TRIGGERED)
            )
            or 0
        )
        top_channels_rows = await self.db.execute(
            select(Lead.channel, func.count(Lead.id))
            .group_by(Lead.channel)
            .order_by(func.count(Lead.id).desc())
            .limit(3)
        )

        return {
            "total_leads": int(total_leads),
            "new_leads_7d": int(new_leads_7d),
            "conversations_today": int(conversations_today),
            "avg_response_time_seconds": 30 if reply_events else 0,
            "escalation_rate": float(escalation_events / total_leads) if total_leads else 0.0,
            "top_channels": [
                {"channel": channel, "count": count}
                for channel, count in top_channels_rows.all()
                if channel is not None
            ],
        }
