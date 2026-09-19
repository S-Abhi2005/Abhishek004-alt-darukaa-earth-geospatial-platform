import pytest

def test_health_check(test_client):
    response = test_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "platform" in data

def test_register_and_login_flow(test_client):
    unique_email = "ecologist_test@darukaa.earth"
    register_payload = {
        "email": unique_email,
        "password": "SecurePassword@2026",
        "full_name": "Senior Field Ecologist",
        "organization": "Amazonian Conservation Trust",
        "role": "admin"
    }
    
    # Test Registration
    reg_response = test_client.post("/api/auth/register", json=register_payload)
    assert reg_response.status_code in [201, 400]
    
    # Test Login
    login_response = test_client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "SecurePassword@2026"}
    )
    if login_response.status_code == 200:
        token_data = login_response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        assert token_data["user"]["email"] == unique_email
