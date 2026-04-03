"""
Lead API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.enums import Channel
from app.orchestrator.pipeline import InboundMessage, OrchestratorService
from app.schemas.lead.schemas import LeadCreate, LeadListResponse, LeadRead, LeadUpdate
from app.services.lead.service import LeadService

router = APIRouter()


@router.get("", response_model=LeadListResponse, summary="List all leads")
async def list_leads(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    service = LeadService(db)
    items, total = await service.list_leads(skip, limit)
    return LeadListResponse(items=[LeadRead.model_validate(item) for item in items], total=total)


@router.get("/{lead_id}", response_model=LeadRead, summary="Get lead by ID")
async def get_lead(lead_id: str, db: AsyncSession = Depends(get_db)):
    service = LeadService(db)
    lead = await service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return LeadRead.model_validate(lead)


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED, summary="Create lead")
async def create_lead(payload: LeadCreate, db: AsyncSession = Depends(get_db)):
    service = LeadService(db)
    lead = await service.create_lead(payload)
    return LeadRead.model_validate(lead)


@router.patch("/{lead_id}", response_model=LeadRead, summary="Update lead")
async def update_lead(lead_id: str, payload: LeadUpdate, db: AsyncSession = Depends(get_db)):
    service = LeadService(db)
    lead = await service.get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    updated = await service.update_lead(lead, payload)
    return LeadRead.model_validate(updated)


@router.post("/intake", status_code=status.HTTP_202_ACCEPTED, summary="Inbound message intake")
async def intake_lead(payload: dict, db: AsyncSession = Depends(get_db)):
    try:
        inbound = InboundMessage(
            channel=Channel(payload["channel"]),
            content=payload["content"],
            name=payload.get("name"),
            email=payload.get("email"),
            phone=payload.get("phone"),
            external_thread_id=payload.get("external_thread_id"),
        )
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=f"Missing field: {exc.args[0]}") from exc

    result = await OrchestratorService(db).process(inbound)
    return {"status": "processed", **result}
