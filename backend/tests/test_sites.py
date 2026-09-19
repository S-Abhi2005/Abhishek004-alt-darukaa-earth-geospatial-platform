import pytest

def test_get_sites_endpoint(test_client):
    response = test_client.get("/api/sites")
    assert response.status_code == 200
    sites = response.json()
    assert isinstance(sites, list)

def test_postgis_site_geojson_structure(test_client):
    response = test_client.get("/api/sites")
    if response.status_code == 200 and len(response.json()) > 0:
        first_site = response.json()[0]
        assert "geometry" in first_site
        assert first_site["geometry"]["type"] in ["Polygon", "MultiPolygon"]
        assert "coordinates" in first_site["geometry"]
        assert first_site["area_hectares"] > 0
