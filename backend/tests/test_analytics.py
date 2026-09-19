import pytest

def test_site_analytics_response_structure(test_client):
    # Retrieve a site ID
    sites_res = test_client.get("/api/sites")
    if sites_res.status_code == 200 and len(sites_res.json()) > 0:
        site_id = sites_res.json()[0]["id"]
        analytics_res = test_client.get(f"/api/sites/{site_id}/analytics")
        assert analytics_res.status_code == 200
        data = analytics_res.json()
        assert "summary_kpis" in data
        assert "total_carbon_stock_tco2e" in data["summary_kpis"]
        assert "historical_performance" in data
        assert len(data["historical_performance"]) >= 12
        assert "carbon_breakdown_by_pool" in data
        assert "biodiversity_breakdown" in data
