from typing import Dict, Any, List
import math

def generate_telemetry_analytics(site_id: str, site_name: str, project_name: str, area_hectares: float) -> Dict[str, Any]:
    # Calculate carbon and ecological benchmarks
    total_carbon = round(area_hectares * 143.2)
    annual_seq = round(area_hectares * 4.8)
    base_ndvi = 0.68
    
    historical = []
    months = [
        "Jan 24", "Feb 24", "Mar 24", "Apr 24", "May 24", "Jun 24",
        "Jul 24", "Aug 24", "Sep 24", "Oct 24", "Nov 24", "Dec 24",
        "Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25",
        "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25"
    ]
    
    for i, month in enumerate(months):
        progress = i / (len(months) - 1)
        seasonal_flux = 0.03 * math.sin(i * 0.5)
        ndvi = round(base_ndvi + (progress * 0.12) + seasonal_flux, 3)
        canopy = round(64.0 + (progress * 17.5) + (seasonal_flux * 20), 1)
        biomass = round(120.0 + (progress * 38.0), 1)
        c_stock = round((total_carbon * 0.72) + (progress * (total_carbon * 0.28)))
        soil_c = round(2.8 + (progress * 0.9), 2)
        precip = round(140.0 + 90.0 * math.sin((i + 3) * 0.52), 1)
        
        historical.append({
            "date": month,
            "ndvi": ndvi,
            "canopy_density_percent": canopy,
            "biomass_density_t_ha": biomass,
            "carbon_stock_tco2e": c_stock,
            "soil_organic_carbon_percent": soil_c,
            "species_richness_index": round(3.2 + (progress * 0.95), 2),
            "tree_loss_alerts": 0 if i > 12 else (1 if i % 6 == 0 else 0),
            "precipitation_mm": precip,
        })

    return {
        "site_id": site_id,
        "site_name": site_name,
        "project_name": project_name,
        "area_hectares": area_hectares,
        "summary_kpis": {
            "total_carbon_stock_tco2e": total_carbon,
            "annual_sequestration_rate_t_yr": annual_seq,
            "current_ndvi": historical[-1]["ndvi"],
            "ndvi_growth_pct": 14.8,
            "shannon_biodiversity_index": 4.12,
            "tree_canopy_cover_pct": historical[-1]["canopy_density_percent"],
            "species_monitored_count": 38,
            "carbon_credit_vintage": "2025-2026 Dual Certified",
            "verification_status": "VCS + CCBA Gold Verified",
        },
        "carbon_breakdown_by_pool": [
            {"pool": "Above-Ground Living Biomass (AGB)", "tco2e": round(total_carbon * 0.58), "percentage": 58.0},
            {"pool": "Below-Ground Root Biomass (BGB)", "tco2e": round(total_carbon * 0.18), "percentage": 18.0},
            {"pool": "Soil Organic Carbon (0-30cm)", "tco2e": round(total_carbon * 0.19), "percentage": 19.0},
            {"pool": "Deadwood & Forest Litter", "tco2e": round(total_carbon * 0.05), "percentage": 5.0},
        ],
        "biodiversity_breakdown": [
            {"taxa": "Keystone Flora & Canopy Emergents", "count": 14, "status": "Stable Growth"},
            {"taxa": "Apex Mammals (e.g. Panthera onca)", "count": 6, "status": "Vulnerable"},
            {"taxa": "Avifauna & Canopy Birds", "count": 18, "status": "Flourishing"},
            {"taxa": "Herpetofauna & Bio-Indicators", "count": 9, "status": "Endangered"},
        ],
        "historical_performance": historical,
    }
