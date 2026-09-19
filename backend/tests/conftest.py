import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.session import Base, get_db
from app.config import settings

# Test SQLite or mock session for unit tests
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def test_client():
    client = TestClient(app)
    return client

@pytest.fixture
def auth_headers(test_client):
    # Register/Login user and obtain token
    login_resp = test_client.post(
        "/api/auth/login",
        json={"email": "admin@darukaa.earth", "password": "Admin@12345"}
    )
    if login_resp.status_code == 200:
        token = login_resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    # Otherwise register new user
    reg_resp = test_client.post(
        "/api/auth/register",
        json={
            "email": "tester@darukaa.earth",
            "password": "TestPassword123!",
            "full_name": "Test Engineer",
            "organization": "Darukaa QA Lab"
        }
    )
    token = reg_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
