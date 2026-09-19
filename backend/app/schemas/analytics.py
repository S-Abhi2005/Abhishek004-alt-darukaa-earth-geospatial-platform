from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TimeSeriesPoint(BaseModel):
    date: str
    ndvi: float
    canopy_density_percent: float
    biomass_density_t_ha: float
    carbon_stock_tco2e: float
    soil_organic_carbon_percent: float
    species_richness_index: float
    tree_loss_alerts: int
    precipitation_mm: float

class SummaryKPIs(BaseModel):
    total_carbon_stock_tco2e: float
    annual_sequestration_rate_t_yr: float
    current_ndvi: float
    ndvi_growth_pct: float
    shannon_biodiversity_index: float
    tree_canopy_cover_pct: float
    species_monitored_count: int
    carbon_credit_vintage: str
    verification_status: str

class CarbonPool(BaseModel):
    pool: str
    tco2e: float
    percentage: float

class BiodiversityTaxa(BaseModel):
    taxa: str
    count: int
    status: str

class SiteAnalyticsResponse(BaseModel):
    site_id: str
    site_name: str
    project_name: str
    area_hectares: float
    summary_kpis: SummaryKPIs
    carbon_breakdown_by_pool: List[CarbonPool]
    biodiversity_breakdown: List[BiodiversityTaxa]
    historical_performance: List[TimeSeriesPoint]
