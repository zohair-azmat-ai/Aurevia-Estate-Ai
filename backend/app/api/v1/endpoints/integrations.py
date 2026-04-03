"""
Integration management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.integration.schemas import (
    IntegrationActionResponse,
    IntegrationListResponse,
    IntegrationProviderRead,
    IntegrationTestSendRequest,
)
from app.services.analytics import AnalyticsService
from app.services.integration import IntegrationService
from app.integrations.email import EmailIntegration
from app.integrations.whatsapp import WhatsAppIntegration
from app.models.enums import Channel, EventType

router = APIRouter()


@router.get("", response_model=IntegrationListResponse, summary="List integrations")
async def list_integrations(db: AsyncSession = Depends(get_db)):
    service = IntegrationService(db)
    items = await service.list_integrations()
    return IntegrationListResponse(
        items=[
            IntegrationProviderRead(
                provider=item.provider,
                display_name=item.display_name,
                status=item.status,
                health=item.health,
                notes=item.notes,
                config_metadata=service._provider_defaults(item.provider)["config_metadata"],
                last_checked_at=item.last_checked_at,
                last_synced_at=item.last_synced_at,
            )
            for item in items
        ],
        total=len(items),
    )


@router.get("/{provider}", response_model=IntegrationProviderRead, summary="Get integration")
async def get_integration(provider: str, db: AsyncSession = Depends(get_db)):
    service = IntegrationService(db)
    item = await service.get_integration(provider)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    defaults = service._provider_defaults(provider)
    return IntegrationProviderRead(
        provider=item.provider,
        display_name=item.display_name,
        status=item.status,
        health=item.health,
        notes=item.notes,
        config_metadata=defaults["config_metadata"],
        last_checked_at=item.last_checked_at,
        last_synced_at=item.last_synced_at,
    )


@router.post("/{provider}/test", response_model=IntegrationActionResponse, summary="Test integration")
async def test_integration(provider: str, db: AsyncSession = Depends(get_db)):
    service = IntegrationService(db)
    if await service.get_integration(provider) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return await service.test_provider(provider)


@router.post("/{provider}/sync", response_model=IntegrationActionResponse, summary="Sync integration metadata")
async def sync_integration(provider: str, db: AsyncSession = Depends(get_db)):
    service = IntegrationService(db)
    if await service.get_integration(provider) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return await service.sync_provider(provider)


@router.post("/whatsapp/test-send", response_model=IntegrationActionResponse, summary="Test WhatsApp outbound send")
async def test_whatsapp_send(
    payload: IntegrationTestSendRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await WhatsAppIntegration().send_message(payload.to, payload.message)
    await AnalyticsService(db).log(
        EventType.OUTBOUND_MESSAGE_QUEUED,
        channel=Channel.WHATSAPP,
        payload={"provider": "whatsapp", "to": payload.to, "external_id": result.external_id},
    )
    return IntegrationActionResponse(
        provider="whatsapp",
        action="test-send",
        status=result.status,
        message=result.message,
        details={"external_id": result.external_id, "placeholder": result.placeholder},
    )


@router.post("/email/test-send", response_model=IntegrationActionResponse, summary="Test email outbound send")
async def test_email_send(
    payload: IntegrationTestSendRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await EmailIntegration().send_message(
        to=payload.to,
        subject=payload.subject or "Aurevia test message",
        body=payload.message,
    )
    await AnalyticsService(db).log(
        EventType.OUTBOUND_MESSAGE_QUEUED,
        channel=Channel.EMAIL,
        payload={"provider": "email", "to": payload.to, "external_id": result.external_id},
    )
    return IntegrationActionResponse(
        provider="email",
        action="test-send",
        status=result.status,
        message=result.message,
        details={"external_id": result.external_id, "placeholder": result.placeholder},
    )
