# Aurevia Estate AI — Architecture

## Overview

Aurevia is a monorepo AI SaaS platform with a clear separation between frontend, backend, and infrastructure layers.

## Services

| Service | Technology | Port |
|---------|-----------|------|
| Frontend | Next.js 14 | 3000 |
| Backend API | FastAPI | 8000 |
| Database | PostgreSQL 16 | 5432 |
| Vector Store | Qdrant | 6333 |

## AI Pipeline

```
Inbound Message
    └─ Channel Ingestion
        └─ Intent Detection        (GPT-4o, classification)
            └─ Structured Extraction   (GPT-4o, function calling)
                └─ RAG Retrieval        (Qdrant semantic search)
                    └─ LLM Reply         (GPT-4o, with context)
                        ├─ CRM Update
                        ├─ Follow-Up Schedule
                        ├─ Escalation Check
                        └─ Analytics Log
```

## Database Schema

See `backend/app/models/` for full SQLAlchemy models.

Core tables:
- `leads` — primary lead records
- `conversations` — one per lead per session
- `messages` — individual messages in a conversation
- `follow_ups` — scheduled automation tasks
- `escalations` — human handoff records
- `knowledge_documents` — RAG source documents
- `events` — analytics event log

## RAG Architecture

Documents are chunked (~500 tokens) and embedded using `text-embedding-3-small`.
Chunks are stored in Qdrant with metadata (category, document_id, title).
At query time, the user message is embedded and top-K most similar chunks are retrieved.
Retrieved context is injected into the GPT-4o system prompt.
