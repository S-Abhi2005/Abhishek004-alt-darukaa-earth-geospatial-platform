from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.site import SiteResponse
from app.auth.security import get_current_user
from geoalchemy2.shape import to_shape
import json

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    results = []
    for p in projects:
        sites_count = db.query(Site).filter(Site.project_id == p.id).count()
        sites = db.query(Site).filter(Site.project_id == p.id).all()
        total_area = round(sum(s.area_hectares for s in sites), 1)
        total_carbon = round(total_area * 92.5)
        
        proj_dict = ProjectResponse.from_orm(p)
        proj_dict.sites_count = sites_count
        proj_dict.total_area_hectares = total_area
        proj_dict.total_carbon_stored = total_carbon
        results.append(proj_dict)
    return results

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_project = Project(
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        category=project_in.category,
        country=project_in.country,
        region=project_in.region or project_in.country,
        status=project_in.status,
        standard=project_in.standard,
        target_carbon_offset=project_in.target_carbon_offset,
        created_by=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    resp = ProjectResponse.from_orm(new_project)
    resp.sites_count = 0
    resp.total_area_hectares = 0.0
    resp.total_carbon_stored = 0.0
    return resp

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    sites = db.query(Site).filter(Site.project_id == project.id).all()
    total_area = round(sum(s.area_hectares for s in sites), 1)
    
    resp = ProjectResponse.from_orm(project)
    resp.sites_count = len(sites)
    resp.total_area_hectares = total_area
    resp.total_carbon_stored = round(total_area * 92.5)
    return resp

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"success": True, "message": "Project and associated PostGIS sites deleted"}
