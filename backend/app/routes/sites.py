from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database.session import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse
from app.auth.security import get_current_user
from shapely.geometry import shape, mapping, Polygon
from geoalchemy2.shape import from_shape, to_shape
import json

router = APIRouter(tags=["Sites"])

def format_site_response(site: Site, project_name: Optional[str] = None) -> SiteResponse:
    shapely_geom = to_shape(site.geometry)
    geo_dict = mapping(shapely_geom)
    return SiteResponse(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        description=site.description,
        site_code=site.site_code,
        geometry=geo_dict,
        area_hectares=site.area_hectares,
        elevation_meters=site.elevation_meters,
        canopy_cover_percent=site.canopy_cover_percent,
        soil_type=site.soil_type,
        biome=site.biome,
        baseline_year=site.baseline_year,
        created_at=site.created_at,
        updated_at=site.updated_at,
        project_name=project_name or (site.project.name if site.project else None)
    )

@router.get("/sites", response_model=List[SiteResponse])
def get_all_sites(db: Session = Depends(get_db)):
    sites = db.query(Site).all()
    return [format_site_response(s) for s in sites]

@router.get("/projects/{project_id}/sites", response_model=List[SiteResponse])
def get_project_sites(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    sites = db.query(Site).filter(Site.project_id == project_id).all()
    return [format_site_response(s, project.name) for s in sites]

@router.post("/projects/{project_id}/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    project_id: str,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Parse GeoJSON into Shapely geometry
    try:
        geom_dict = site_in.geometry.model_dump() if hasattr(site_in.geometry, "model_dump") else site_in.geometry.dict()
        shapely_poly = shape(geom_dict)
        if not shapely_poly.is_valid:
            shapely_poly = shapely_poly.buffer(0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid GeoJSON Polygon: {str(e)}")
    
    # Calculate area if not supplied
    if not site_in.area_hectares or site_in.area_hectares <= 0:
        # Approximate spherical projection area in hectares
        area_ha = round((shapely_poly.area * 111319.5 * 111319.5) / 10000.0, 1)
        area_ha = max(10.0, area_ha)
    else:
        area_ha = site_in.area_hectares

    # Convert shapely to GeoAlchemy2 PostGIS element with SRID 4326
    postgis_geom = from_shape(shapely_poly, srid=4326)

    new_site = Site(
        project_id=project_id,
        name=site_in.name,
        description=site_in.description,
        site_code=site_in.site_code or f"DKA-{int(area_ha)}-{site_in.name[:3].upper()}",
        geometry=postgis_geom,
        area_hectares=area_ha,
        elevation_meters=site_in.elevation_meters or 150.0,
        canopy_cover_percent=site_in.canopy_cover_percent or 75.0,
        soil_type=site_in.soil_type,
        biome=site_in.biome or "Tropical Evergreen Moist Forest",
        baseline_year=site_in.baseline_year or 2024
    )
    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return format_site_response(new_site, project.name)

@router.get("/sites/{site_id}", response_model=SiteResponse)
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return format_site_response(site)

@router.delete("/sites/{site_id}")
def delete_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return {"success": True, "message": "Site deleted successfully"}
