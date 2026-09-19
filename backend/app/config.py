from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "DARUKAA.EARTH Geospatial Engine"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "darukaa-earth-enterprise-geospatial-secret-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PostgreSQL with PostGIS connection string
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/darukaa_earth"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://*.run.app",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
