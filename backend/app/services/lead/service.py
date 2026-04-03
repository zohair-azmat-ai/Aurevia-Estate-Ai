"""
Lead service implementation.
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead
from app.schemas.lead.schemas import LeadCreate, LeadUpdate


class LeadService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_lead(self, payload: LeadCreate) -> Lead:
        lead = Lead(**payload.model_dump())
        self.db.add(lead)
        await self.db.flush()
        await self.db.refresh(lead)
        return lead

    async def update_lead(self, lead: Lead, payload: LeadUpdate) -> Lead:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(lead, field, value)
        await self.db.flush()
        await self.db.refresh(lead)
        return lead

    async def get_lead(self, lead_id: str) -> Lead | None:
        result = await self.db.execute(select(Lead).where(Lead.id == lead_id))
        return result.scalar_one_or_none()

    async def list_leads(self, skip: int = 0, limit: int = 50) -> tuple[list[Lead], int]:
        total = await self.db.scalar(select(func.count()).select_from(Lead)) or 0
        result = await self.db.execute(
            select(Lead).order_by(Lead.updated_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), total

    async def enrich_lead(self, lead: Lead, enrichment: dict) -> Lead:
        for field, value in enrichment.items():
            if value is not None and hasattr(lead, field):
                setattr(lead, field, value)
        await self.db.flush()
        await self.db.refresh(lead)
        return lead
