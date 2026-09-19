from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str = "Reforestation"
    category: str = "Carbon Sequestration"
    country: str
    region: Optional[str] = None
    status: str = "Active"
    standard: str = "Verra VCS"
    target_carbon_offset: float = 100000.0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    target_carbon_offset: Optional[float] = None

class ProjectResponse(ProjectBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    sites_count: Optional[int] = 0
    total_area_hectares: Optional[float] = 0.0
    total_carbon_stored: Optional[float] = 0.0

    class Config:
        from_attributes = True
