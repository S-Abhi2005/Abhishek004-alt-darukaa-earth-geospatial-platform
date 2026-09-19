from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.site import Site
from app.schemas.analytics import SiteAnalyticsResponse
from app.services.analytics_service import generate_telemetry_analytics

router = APIRouter(prefix="/sites", tags=["Analytics"])

@router.get("/{site_id}/analytics", response_model=SiteAnalyticsResponse)
def get_site_analytics(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    project_name = site.project.name if site.project else "Ecological Restoration Project"
    analytics_data = generate_telemetry_analytics(
        site_id=site.id,
        site_name=site.name,
        project_name=project_name,
        area_hectares=site.area_hectares
    )
    return analytics_data
