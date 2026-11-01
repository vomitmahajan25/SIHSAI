from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import entities # ensures all models are loaded
from app.services.festival_service import FestivalService
from app.api.v1 import api_v1_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed initial festivals if needed
with SessionLocal() as db:
    FestivalService.seed_initial_festivals(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs (SIH 2026 PS 10091)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    # Log exception internally
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "error_message": str(exc) if settings.APP_ENV == "development" else "Server error"
        }
    )

# Health endpoint
@app.get("/health", tags=["System"])
def health_check():
    db_status = "healthy"
    try:
        with SessionLocal() as db:
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "ai_provider": "gemini" if settings.GEMINI_API_KEY else "deterministic_fallback",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Mount API
app.include_router(api_v1_router, prefix="/api")
