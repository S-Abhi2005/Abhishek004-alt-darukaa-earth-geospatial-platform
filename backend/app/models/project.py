from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(100), nullable=False, default="Reforestation")
    category = Column(String(100), nullable=False, default="Carbon Sequestration")
    country = Column(String(100), nullable=False, index=True)
    region = Column(String(150), nullable=True)
    status = Column(String(50), nullable=False, default="Active")
    standard = Column(String(100), nullable=False, default="Verra VCS")
    target_carbon_offset = Column(Float, nullable=False, default=100000.0)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    creator = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")
