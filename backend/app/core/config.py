import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "GramVikas AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    APP_ENV: str = "development"
    
    # Database: Defaults to SQLite for local development, easily overridden with PostgreSQL/Supabase
    DATABASE_URL: str = "sqlite:///./gramvikas.db"
    
    # Security / Auth
    JWT_SECRET: str = "gramvikas_ai_sih_2026_super_secure_secret_key_change_in_production_9013cb"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # External AI / LLM
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gramvikas-ai.vercel.app",
    ]
    
    # File Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_FILE_TYPES: list[str] = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
