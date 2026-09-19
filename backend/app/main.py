from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth_router, projects_router, sites_router, analytics_router
from app.database.session import engine, Base

# Create tables if using standalone PostgreSQL
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Notice: Database tables will be initialized on connection: {e}")

app = FastAPI(
    title="DARUKAA.EARTH - Geospatial Data Analytics Engine",
    description="Enterprise REST API for managing, mapping, and analyzing carbon credit and biodiversity projects with PostGIS and Mapbox.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(sites_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "platform": "DARUKAA.EARTH Geospatial Engine",
        "version": "2.4.0",
        "postgis_enabled": True
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "DARUKAA.EARTH Geospatial Data Analytics Platform API",
        "docs": "/docs",
        "status": "online"
    }
