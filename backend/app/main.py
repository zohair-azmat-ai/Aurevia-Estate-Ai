"""
Aurevia Estate AI - FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, logger
from app.db.session import close_db, init_db

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s in %s mode", settings.APP_NAME, settings.APP_ENV)
    await init_db()
    yield
    await close_db()
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered real estate lead automation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["root"])
async def root():
    return {
        "product": settings.APP_NAME,
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }
