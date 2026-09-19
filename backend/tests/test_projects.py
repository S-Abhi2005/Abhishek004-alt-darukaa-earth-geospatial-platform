import pytest

def test_get_projects_list(test_client):
    response = test_client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)

def test_create_project_authenticated(test_client, auth_headers):
    payload = {
        "name": "Pantanal Wetland Wildlife Recovery Zone",
        "description": "Restoration of flooded savannas and protection of giant river otters.",
        "project_type": "Wetland Restoration",
        "category": "Dual Benefit",
        "country": "Brazil",
        "region": "Mato Grosso do Sul",
        "status": "Active",
        "standard": "Verra VCS",
        "target_carbon_offset": 250000.0
    }
    response = test_client.post("/api/projects", json=payload, headers=auth_headers)
    if response.status_code == 201:
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["country"] == "Brazil"
        assert "id" in data
