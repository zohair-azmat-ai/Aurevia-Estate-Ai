"""
Aurevia Estate AI — Health Check Endpoint
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@router.get("", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="aurevia-backend",
        version="1.0.0",
    )
