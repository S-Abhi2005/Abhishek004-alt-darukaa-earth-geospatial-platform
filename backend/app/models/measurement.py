from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database.session import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)
    ndvi = Column(Float, nullable=False)
    canopy_density_percent = Column(Float, nullable=False)
    biomass_density_t_ha = Column(Float, nullable=False)
    carbon_stock_tco2e = Column(Float, nullable=False)
    soil_organic_carbon_percent = Column(Float, nullable=False)
    species_richness_index = Column(Float, nullable=False)
    tree_loss_alerts = Column(Integer, default=0)
    precipitation_mm = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    site = relationship("Site", back_populates="measurements")
