"""
Aurevia Estate AI — API v1 Router
Aggregates all endpoint routers under /api/v1
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    conversations,
    escalations,
    follow_ups,
    health,
    integrations,
    knowledge,
    leads,
    messages,
    settings,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(follow_ups.router, prefix="/follow-ups", tags=["follow-ups"])
api_router.include_router(escalations.router, prefix="/escalations", tags=["escalations"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(webhooks.router, tags=["webhooks"])
