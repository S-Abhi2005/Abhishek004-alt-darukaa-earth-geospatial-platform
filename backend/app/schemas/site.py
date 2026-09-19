from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[Any]

class SiteBase(BaseModel):
    name: str
    description: Optional[str] = None
    site_code: Optional[str] = None
    biome: Optional[str] = "Tropical Evergreen Moist Forest"
    elevation_meters: Optional[float] = 150.0
    canopy_cover_percent: Optional[float] = 75.0
    soil_type: Optional[str] = "Humic Cambisols"
    baseline_year: Optional[int] = 2024

class SiteCreate(SiteBase):
    geometry: GeoJSONGeometry
    area_hectares: Optional[float] = None

class SiteResponse(SiteBase):
    id: str
    project_id: str
    geometry: Dict[str, Any]
    area_hectares: float
    created_at: datetime
    updated_at: datetime
    project_name: Optional[str] = None

    class Config:
        from_attributes = True
