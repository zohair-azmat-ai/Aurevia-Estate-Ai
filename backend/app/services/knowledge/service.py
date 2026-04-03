"""
Knowledge document service implementation.
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import KnowledgeStatus
from app.models.knowledge import KnowledgeDocument
from app.schemas.knowledge.schemas import KnowledgeDocumentCreate


class KnowledgeService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_document(self, payload: KnowledgeDocumentCreate) -> KnowledgeDocument:
        document = KnowledgeDocument(**payload.model_dump())
        self.db.add(document)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def update_document(self, document: KnowledgeDocument, **fields) -> KnowledgeDocument:
        for key, value in fields.items():
            setattr(document, key, value)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def list_documents(self, skip: int = 0, limit: int = 50) -> tuple[list[KnowledgeDocument], int]:
        total = await self.db.scalar(select(func.count()).select_from(KnowledgeDocument)) or 0
        result = await self.db.execute(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.status != KnowledgeStatus.ARCHIVED)
            .order_by(KnowledgeDocument.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_document(self, document_id: str) -> KnowledgeDocument | None:
        result = await self.db.execute(
            select(KnowledgeDocument).where(KnowledgeDocument.id == document_id)
        )
        return result.scalar_one_or_none()

    async def archive_document(self, document: KnowledgeDocument) -> KnowledgeDocument:
        return await self.update_document(
            document,
            status=KnowledgeStatus.ARCHIVED,
        )

    async def reset_for_retry(self, document: KnowledgeDocument) -> KnowledgeDocument:
        return await self.update_document(
            document,
            status=KnowledgeStatus.UPLOADED,
            error_message=None,
        )
