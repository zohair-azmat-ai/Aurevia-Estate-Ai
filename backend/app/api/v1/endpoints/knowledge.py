"""
Knowledge / RAG API endpoints — ingestion, indexing, and retrieval.
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.enums import EventType, KnowledgeCategory, KnowledgeStatus
from app.rag.service import RAGService
from app.schemas.knowledge.schemas import (
    KnowledgeActionResult,
    KnowledgeDocumentCreate,
    KnowledgeDocumentListResponse,
    KnowledgeDocumentRead,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeUploadRequest,
)
from app.services.analytics import AnalyticsService
from app.services.knowledge.service import KnowledgeService

router = APIRouter()

_MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


# ------------------------------------------------------------------ #
# List & detail                                                         #
# ------------------------------------------------------------------ #


@router.get("", response_model=KnowledgeDocumentListResponse, summary="List knowledge documents")
async def list_documents(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = KnowledgeService(db)
    items, total = await service.list_documents(skip, limit)
    return KnowledgeDocumentListResponse(
        items=[KnowledgeDocumentRead.model_validate(item) for item in items],
        total=total,
    )


@router.get("/{document_id}", response_model=KnowledgeDocumentRead, summary="Get a knowledge document")
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    service = KnowledgeService(db)
    document = await service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return KnowledgeDocumentRead.model_validate(document)


# ------------------------------------------------------------------ #
# Upload                                                                #
# ------------------------------------------------------------------ #


@router.post("/upload", response_model=KnowledgeDocumentRead, summary="Upload a knowledge document (multipart)")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Accept a file upload. Extracts text content and stores the document
    with status=uploaded ready for indexing."""
    content_bytes = await file.read()
    if len(content_bytes) > _MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 10 MB limit.",
        )

    try:
        knowledge_category = KnowledgeCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category '{category}'.",
        )

    rag = RAGService()
    content_text = rag.extract_text(content_bytes, file.filename, file.content_type)

    # Derive file extension
    ext = ""
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()

    payload = KnowledgeDocumentCreate(
        title=title,
        category=knowledge_category,
        content=content_text,
        filename=file.filename,
        file_type=ext or None,
        file_size=len(content_bytes),
        source_type="upload",
        status=KnowledgeStatus.UPLOADED,
    )

    service = KnowledgeService(db)
    document = await service.create_document(payload)

    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_UPLOADED,
        payload={"document_id": document.id, "filename": file.filename, "bytes": len(content_bytes)},
    )

    return KnowledgeDocumentRead.model_validate(document)


@router.post("/ingest", response_model=KnowledgeDocumentRead, summary="Ingest a knowledge document (JSON body)")
async def ingest_document(payload: KnowledgeUploadRequest, db: AsyncSession = Depends(get_db)):
    """Legacy/API ingest endpoint — accepts raw content as JSON."""
    create_payload = KnowledgeDocumentCreate(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        filename=payload.filename,
        file_type=payload.file_type,
        source_type=payload.source_type or "api",
        status=KnowledgeStatus.UPLOADED,
    )
    service = KnowledgeService(db)
    document = await service.create_document(create_payload)
    rag_service = RAGService()
    qdrant_ids = await rag_service.ingest_document(service, document)
    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_INGESTED,
        payload={"document_id": document.id, "points": len(qdrant_ids)},
    )
    refreshed = await service.get_document(document.id)
    return KnowledgeDocumentRead.model_validate(refreshed or document)


# ------------------------------------------------------------------ #
# Indexing actions                                                      #
# ------------------------------------------------------------------ #


@router.post("/{document_id}/index", response_model=KnowledgeActionResult, summary="Index a document")
async def index_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Trigger RAG indexing for an uploaded document that is not yet indexed."""
    service = KnowledgeService(db)
    document = await service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    if document.status == KnowledgeStatus.INDEXED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is already indexed. Use /reindex to force re-indexing.",
        )
    if document.status == KnowledgeStatus.INDEXING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is currently being indexed.",
        )

    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_INDEX_STARTED,
        payload={"document_id": document.id},
    )

    rag = RAGService()
    qdrant_ids = await rag.ingest_document(service, document)

    refreshed = await service.get_document(document.id)
    doc = refreshed or document

    event = (
        EventType.KNOWLEDGE_INDEX_COMPLETED
        if doc.status == KnowledgeStatus.INDEXED
        else EventType.KNOWLEDGE_INDEX_FAILED
    )
    await AnalyticsService(db).log(
        event,
        payload={"document_id": doc.id, "points": len(qdrant_ids), "error": doc.error_message},
    )

    return KnowledgeActionResult(
        document_id=doc.id,
        action="index",
        status=doc.status,
        message=(
            f"Indexed {doc.chunk_count} chunks successfully."
            if doc.status == KnowledgeStatus.INDEXED
            else f"Indexing failed: {doc.error_message}"
        ),
        chunk_count=doc.chunk_count,
        last_indexed_at=doc.last_indexed_at,
        error_message=doc.error_message,
    )


@router.post("/{document_id}/reindex", response_model=KnowledgeActionResult, summary="Reindex a document")
async def reindex_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete existing vectors and re-run the full indexing pipeline."""
    service = KnowledgeService(db)
    document = await service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    rag = RAGService()

    # Remove old vectors if any
    await rag.delete_document_vectors(document)

    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_INDEX_STARTED,
        payload={"document_id": document.id, "action": "reindex"},
    )

    qdrant_ids = await rag.ingest_document(service, document)
    refreshed = await service.get_document(document.id)
    doc = refreshed or document

    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_REINDEXED,
        payload={"document_id": doc.id, "points": len(qdrant_ids)},
    )

    return KnowledgeActionResult(
        document_id=doc.id,
        action="reindex",
        status=doc.status,
        message=(
            f"Reindexed {doc.chunk_count} chunks successfully."
            if doc.status == KnowledgeStatus.INDEXED
            else f"Reindex failed: {doc.error_message}"
        ),
        chunk_count=doc.chunk_count,
        last_indexed_at=doc.last_indexed_at,
        error_message=doc.error_message,
    )


@router.post("/{document_id}/retry", response_model=KnowledgeActionResult, summary="Retry failed indexing")
async def retry_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Retry indexing for a document in FAILED state."""
    service = KnowledgeService(db)
    document = await service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    if document.status != KnowledgeStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Document is not in a failed state (current: {document.status.value}).",
        )

    document = await service.reset_for_retry(document)

    rag = RAGService()
    qdrant_ids = await rag.ingest_document(service, document)
    refreshed = await service.get_document(document.id)
    doc = refreshed or document

    event = (
        EventType.KNOWLEDGE_INDEX_COMPLETED
        if doc.status == KnowledgeStatus.INDEXED
        else EventType.KNOWLEDGE_INDEX_FAILED
    )
    await AnalyticsService(db).log(
        event,
        payload={"document_id": doc.id, "action": "retry", "points": len(qdrant_ids)},
    )

    return KnowledgeActionResult(
        document_id=doc.id,
        action="retry",
        status=doc.status,
        message=(
            f"Retry succeeded — {doc.chunk_count} chunks indexed."
            if doc.status == KnowledgeStatus.INDEXED
            else f"Retry failed: {doc.error_message}"
        ),
        chunk_count=doc.chunk_count,
        last_indexed_at=doc.last_indexed_at,
        error_message=doc.error_message,
    )


# ------------------------------------------------------------------ #
# Delete                                                                #
# ------------------------------------------------------------------ #


@router.delete("/{document_id}", response_model=KnowledgeActionResult, summary="Archive/delete a document")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Remove document vectors from Qdrant and mark the record as archived."""
    service = KnowledgeService(db)
    document = await service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    rag = RAGService()
    await rag.delete_document_vectors(document)
    await service.archive_document(document)

    await AnalyticsService(db).log(
        EventType.KNOWLEDGE_DELETED,
        payload={"document_id": document_id},
    )

    return KnowledgeActionResult(
        document_id=document_id,
        action="delete",
        status=KnowledgeStatus.ARCHIVED,
        message="Document archived and vectors removed from the knowledge base.",
        chunk_count=0,
    )


# ------------------------------------------------------------------ #
# Search                                                                #
# ------------------------------------------------------------------ #


@router.post("/search", response_model=KnowledgeSearchResponse, summary="Semantic search over knowledge base")
async def search_knowledge(payload: KnowledgeSearchRequest):
    results = await RAGService().retrieve(payload.query, payload.top_k)
    return KnowledgeSearchResponse(results=results)
