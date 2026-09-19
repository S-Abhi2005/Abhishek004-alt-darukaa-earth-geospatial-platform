from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import uuid
from app.database.session import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    site_code = Column(String(50), nullable=False, unique=True, index=True)
    
    # PostGIS Polygon Geometry with SRID 4326 (WGS 84 spatial coordinate reference system)
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)
    
    area_hectares = Column(Float, nullable=False)
    elevation_meters = Column(Float, nullable=True, default=150.0)
    canopy_cover_percent = Column(Float, nullable=True, default=75.0)
    soil_type = Column(String(255), nullable=True)
    biome = Column(String(255), nullable=True)
    baseline_year = Column(Integer, nullable=True, default=2024)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    project = relationship("Project", back_populates="sites")
    measurements = relationship("Measurement", back_populates="site", cascade="all, delete-orphan")
