"""
CRM coordination service.
"""

from app.models.enums import LeadStatus
from app.schemas.lead.schemas import LeadCreate, LeadUpdate
from app.services.lead.service import LeadService


class CRMService:
    def __init__(self, lead_service: LeadService) -> None:
        self.lead_service = lead_service

    async def upsert_lead(self, channel, contact_info: dict, requirements: dict):
        existing = None
        if contact_info.get("email"):
            leads, _ = await self.lead_service.list_leads(0, 200)
            existing = next((lead for lead in leads if lead.email == contact_info["email"]), None)
        if existing:
            return await self.lead_service.enrich_lead(existing, requirements)
        payload = LeadCreate(
            name=contact_info.get("name"),
            email=contact_info.get("email"),
            phone=contact_info.get("phone"),
            channel=channel,
            status=LeadStatus.NEW,
            **requirements,
        )
        return await self.lead_service.create_lead(payload)

    async def update_status(self, lead_id: str, status: LeadStatus):
        lead = await self.lead_service.get_lead(lead_id)
        if lead is None:
            return None
        return await self.lead_service.update_lead(lead, LeadUpdate(status=status))
