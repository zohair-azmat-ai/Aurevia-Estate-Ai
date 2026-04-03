"""
Qdrant client helpers.
"""

from qdrant_client import AsyncQdrantClient

from app.core.config import settings


def get_qdrant_client() -> AsyncQdrantClient:
    return AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
