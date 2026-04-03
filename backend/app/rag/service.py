"""
RAG service implementation backed by Qdrant.
"""

import hashlib
from datetime import datetime, timezone
from typing import Any

from qdrant_client.http import models as qdrant_models

from app.core.config import settings
from app.integrations.openai_client import get_openai_client
from app.integrations.qdrant_client import get_qdrant_client
from app.models.enums import KnowledgeCategory, KnowledgeStatus
from app.schemas.knowledge.schemas import KnowledgeSearchResult
from app.services.knowledge.service import KnowledgeService

# MIME types and extensions treated as plain text
_TEXT_TYPES = {
    "text/plain",
    "text/markdown",
    "text/x-markdown",
    "text/csv",
    "application/json",
}
_TEXT_EXTENSIONS = {".txt", ".md", ".markdown", ".csv", ".json", ".text"}


class RAGService:
    # ------------------------------------------------------------------ #
    # Text extraction                                                       #
    # ------------------------------------------------------------------ #

    def extract_text(self, content_bytes: bytes, filename: str | None, mime_type: str | None) -> str:
        """Extract plain text from file bytes.

        Fully supports text/plain and Markdown. PDF and DOCX are noted
        as future extension points and return a descriptive placeholder.
        """
        ext = ""
        if filename:
            dot_index = filename.rfind(".")
            if dot_index != -1:
                ext = filename[dot_index:].lower()

        is_text = (
            (mime_type and mime_type.split(";")[0].strip() in _TEXT_TYPES)
            or ext in _TEXT_EXTENSIONS
        )

        if is_text:
            try:
                return content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                return content_bytes.decode("latin-1", errors="replace")

        if ext == ".pdf" or (mime_type and "pdf" in mime_type):
            return (
                "[PDF content extraction requires PyMuPDF or pdfplumber — "
                f"add to dependencies and implement RAGService.extract_text for PDF. "
                f"File: {filename}]"
            )

        if ext in {".docx", ".doc"} or (mime_type and "word" in mime_type):
            return (
                "[DOCX content extraction requires python-docx — "
                f"add to dependencies and implement RAGService.extract_text for DOCX. "
                f"File: {filename}]"
            )

        # Generic fallback: attempt UTF-8 decode
        try:
            return content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return f"[Binary file — content extraction not supported for this format. File: {filename}]"

    # ------------------------------------------------------------------ #
    # Chunking & embeddings                                                #
    # ------------------------------------------------------------------ #

    def _chunk_content(self, content: str, chunk_size: int = 500) -> list[str]:
        words = content.split()
        return [
            " ".join(words[index : index + chunk_size])
            for index in range(0, len(words), chunk_size)
            if words[index : index + chunk_size]
        ]

    async def _embed_texts(self, texts: list[str]) -> list[list[float]]:
        client = get_openai_client()
        if client is None:
            return [self._fallback_embedding(text) for text in texts]

        try:
            response = await client.embeddings.create(
                model=settings.OPENAI_EMBEDDING_MODEL,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception:
            return [self._fallback_embedding(text) for text in texts]

    def _fallback_embedding(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        base = [float(byte) / 255.0 for byte in digest]
        repeats = (settings.EMBEDDING_DIMENSION // len(base)) + 1
        vector = (base * repeats)[: settings.EMBEDDING_DIMENSION]
        return vector

    # ------------------------------------------------------------------ #
    # Qdrant collection management                                          #
    # ------------------------------------------------------------------ #

    async def ensure_collection(self) -> None:
        client = get_qdrant_client()
        try:
            collections = await client.get_collections()
            if any(c.name == settings.QDRANT_COLLECTION for c in collections.collections):
                return
            await client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=qdrant_models.VectorParams(
                    size=settings.EMBEDDING_DIMENSION,
                    distance=qdrant_models.Distance.COSINE,
                ),
            )
        except Exception:
            return

    # ------------------------------------------------------------------ #
    # Ingestion                                                             #
    # ------------------------------------------------------------------ #

    async def ingest_document(self, knowledge_service: KnowledgeService, document) -> list[str]:
        """Chunk, embed, and upsert a document into Qdrant.

        Sets last_indexed_at on success. Records error_message on failure.
        """
        chunks = self._chunk_content(document.content)
        vectors = await self._embed_texts(chunks)
        client = get_qdrant_client()
        qdrant_ids: list[str] = []

        await knowledge_service.update_document(document, status=KnowledgeStatus.INDEXING)
        await self.ensure_collection()

        try:
            points: list[qdrant_models.PointStruct] = []
            for index, (chunk, vector) in enumerate(zip(chunks, vectors)):
                point_id = f"{document.id}:{index}"
                qdrant_ids.append(point_id)
                points.append(
                    qdrant_models.PointStruct(
                        id=point_id,
                        vector=vector,
                        payload={
                            "document_id": document.id,
                            "title": document.title,
                            "category": document.category.value,
                            "content": chunk,
                            "filename": document.filename,
                        },
                    )
                )
            if points:
                await client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
            await knowledge_service.update_document(
                document,
                status=KnowledgeStatus.INDEXED,
                chunk_count=len(chunks),
                qdrant_ids=",".join(qdrant_ids),
                last_indexed_at=datetime.now(timezone.utc),
                error_message=None,
            )
            return qdrant_ids
        except Exception as exc:
            await knowledge_service.update_document(
                document,
                status=KnowledgeStatus.FAILED,
                error_message=str(exc),
            )
            return []

    # ------------------------------------------------------------------ #
    # Deletion                                                              #
    # ------------------------------------------------------------------ #

    async def delete_document_vectors(self, document) -> None:
        """Remove all Qdrant points belonging to this document."""
        if not document.qdrant_ids:
            return
        point_ids = [pid.strip() for pid in document.qdrant_ids.split(",") if pid.strip()]
        if not point_ids:
            return
        client = get_qdrant_client()
        try:
            await client.delete(
                collection_name=settings.QDRANT_COLLECTION,
                points_selector=qdrant_models.PointIdsList(points=point_ids),
            )
        except Exception:
            # Non-fatal: vectors may already be gone or collection absent
            pass

    # ------------------------------------------------------------------ #
    # Retrieval                                                             #
    # ------------------------------------------------------------------ #

    async def retrieve(self, query: str, top_k: int | None = None) -> list[KnowledgeSearchResult]:
        client = get_qdrant_client()
        top_k = top_k or settings.RAG_TOP_K
        query_vector = (await self._embed_texts([query]))[0]
        try:
            results = await client.search(
                collection_name=settings.QDRANT_COLLECTION,
                query_vector=query_vector,
                limit=top_k,
                score_threshold=settings.RAG_SCORE_THRESHOLD,
            )
        except Exception:
            return []

        items: list[KnowledgeSearchResult] = []
        for result in results:
            payload: dict[str, Any] = result.payload or {}
            category = payload.get("category", KnowledgeCategory.OTHER.value)
            items.append(
                KnowledgeSearchResult(
                    document_id=str(payload.get("document_id", "")),
                    title=str(payload.get("title", "Knowledge Context")),
                    content=str(payload.get("content", "")),
                    score=float(result.score),
                    category=KnowledgeCategory(category),
                )
            )
        return items
