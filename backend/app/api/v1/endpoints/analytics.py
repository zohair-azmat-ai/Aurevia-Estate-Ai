"""
Analytics API endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.analytics.schemas import AnalyticsEventListResponse, AnalyticsEventRead, AnalyticsSummaryRead
from app.services.analytics import AnalyticsService

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryRead, summary="Dashboard metrics summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    summary = await AnalyticsService(db).get_summary()
    return AnalyticsSummaryRead(**summary)


@router.get("/events", response_model=AnalyticsEventListResponse, summary="List analytics events")
async def list_events(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    items, total = await AnalyticsService(db).list_events(skip, limit)
    return AnalyticsEventListResponse(
        items=[AnalyticsEventRead.model_validate(item) for item in items],
        total=total,
    )
