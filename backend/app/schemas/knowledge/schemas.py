"""
Knowledge schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import KnowledgeCategory, KnowledgeStatus
from app.schemas.common.base import ORMModel


class KnowledgeDocumentBase(BaseModel):
    title: str
    category: KnowledgeCategory
    content: str
    filename: str | None = None
    source_type: str | None = None
    file_type: str | None = None
    file_size: int | None = None
    chunk_count: int = 0
    qdrant_ids: str | None = None
    status: KnowledgeStatus = KnowledgeStatus.UPLOADED
    last_indexed_at: datetime | None = None
    error_message: str | None = None


class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    pass


class KnowledgeDocumentRead(KnowledgeDocumentBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class KnowledgeDocumentListResponse(BaseModel):
    items: list[KnowledgeDocumentRead]
    total: int


class KnowledgeUploadRequest(BaseModel):
    """Schema for text-body uploads (non-multipart)."""
    title: str
    category: KnowledgeCategory
    content: str
    filename: str | None = None
    file_type: str | None = None
    source_type: str | None = None


class KnowledgeActionResult(BaseModel):
    document_id: str
    action: str
    status: KnowledgeStatus
    message: str
    chunk_count: int = 0
    last_indexed_at: datetime | None = None
    error_message: str | None = None


class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 5


class KnowledgeSearchResult(BaseModel):
    document_id: str
    title: str
    content: str
    score: float
    category: KnowledgeCategory


class KnowledgeSearchResponse(BaseModel):
    results: list[KnowledgeSearchResult]
