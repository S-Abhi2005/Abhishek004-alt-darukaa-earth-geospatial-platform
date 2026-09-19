export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  role: UserRole;
  organization?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type ProjectType =
  | 'Reforestation'
  | 'Afforestation'
  | 'Peatland Restoration'
  | 'Blue Carbon / Mangrove'
  | 'Agroforestry'
  | 'Biodiversity Corridor';

export type ProjectCategory =
  | 'Carbon Sequestration'
  | 'Biodiversity Conservation'
  | 'Dual Benefit';

export type ProjectStatus =
  | 'Active'
  | 'Planning'
  | 'Under Verification'
  | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  project_type: ProjectType;
  category: ProjectCategory;
  country: string;
  region: string;
  status: ProjectStatus;
  standard: string;
  target_carbon_offset: number; // in tCO2e
  created_by?: string;
  created_at: string;
  updated_at: string;
  sites_count?: number;
  total_area_hectares?: number;
  total_carbon_stored?: number;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  site_code: string;
  geometry: GeoJSONGeometry;
  area_hectares: number;
  elevation_meters?: number;
  canopy_cover_percent?: number;
  soil_type?: string;
  biome?: string;
  baseline_year?: number;
  created_at: string;
  updated_at: string;
  project_name?: string;
}

export interface TimeSeriesPoint {
  date: string;
  ndvi: number; // 0 - 1
  canopy_density_percent: number;
  biomass_density_t_ha: number;
  carbon_stock_tco2e: number;
  soil_organic_carbon_percent: number;
  species_richness_index: number;
  tree_loss_alerts: number;
  precipitation_mm: number;
}

export interface SiteAnalytics {
  site_id: string;
  site_name: string;
  project_name: string;
  area_hectares: number;
  summary_kpis: {
    total_carbon_stock_tco2e: number;
    annual_sequestration_rate_t_yr: number;
    current_ndvi: number;
    ndvi_growth_pct: number;
    shannon_biodiversity_index: number;
    tree_canopy_cover_pct: number;
    species_monitored_count: number;
    carbon_credit_vintage: string;
    verification_status: 'Verified (VCS)' | 'Pending Audit' | 'Issuance Ready';
  };
  biodiversity_breakdown: {
    taxa: string;
    count: number;
    status: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Stable';
  }[];
  carbon_breakdown_by_pool: {
    pool: string;
    tco2e: number;
    percentage: number;
  }[];
  historical_performance: TimeSeriesPoint[];
}
