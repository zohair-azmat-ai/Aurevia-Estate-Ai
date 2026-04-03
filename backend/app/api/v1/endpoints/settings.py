"""
Settings endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.settings.schemas import (
    AISettings,
    AutomationSettings,
    SettingCategoryRead,
    SettingsRead,
    SettingsUpdate,
)
from app.services.settings import SettingsService

router = APIRouter()


@router.get("", response_model=SettingsRead, summary="Get all settings")
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await SettingsService(db).get_all()


@router.put("", response_model=SettingsRead, summary="Update settings")
async def update_settings(payload: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    return await SettingsService(db).update_all(payload)


@router.get("/ai", response_model=SettingCategoryRead, summary="Get AI settings")
async def get_ai_settings(db: AsyncSession = Depends(get_db)):
    item = await SettingsService(db).get_category("ai")
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings category not found")
    return SettingCategoryRead(**item)


@router.put("/ai", response_model=SettingCategoryRead, summary="Update AI settings")
async def update_ai_settings(payload: AISettings, db: AsyncSession = Depends(get_db)):
    item = await SettingsService(db).update_category("ai", payload.model_dump())
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings category not found")
    return SettingCategoryRead(**item)


@router.get("/automation", response_model=SettingCategoryRead, summary="Get automation settings")
async def get_automation_settings(db: AsyncSession = Depends(get_db)):
    item = await SettingsService(db).get_category("automation")
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings category not found")
    return SettingCategoryRead(**item)


@router.put("/automation", response_model=SettingCategoryRead, summary="Update automation settings")
async def update_automation_settings(
    payload: AutomationSettings, db: AsyncSession = Depends(get_db)
):
    item = await SettingsService(db).update_category("automation", payload.model_dump())
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings category not found")
    return SettingCategoryRead(**item)
