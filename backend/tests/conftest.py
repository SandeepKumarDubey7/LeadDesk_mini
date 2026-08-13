"""
Pytest configuration and shared fixtures for LeadDesk Mini backend tests.
Uses mongomock to mock MongoDB and a lightweight in-memory MockGridFS without connecting to live Atlas.
Disables rate limiting during automated test runs.
"""

import sys
import os
import types
from bson import ObjectId

# Polyfill pkg_resources for Python 3.13 / mongomock compatibility
if "pkg_resources" not in sys.modules:
    pkg_mock = types.ModuleType("pkg_resources")
    pkg_mock.get_distribution = lambda name: types.SimpleNamespace(version="4.3.0")
    sys.modules["pkg_resources"] = pkg_mock

import pytest
from fastapi.testclient import TestClient
import mongomock

# Set dummy env vars before importing app
os.environ["MONGODB_URI"] = "mongodb://localhost:27017/test_db"
os.environ["JWT_SECRET"] = "test_secret_key_1234567890_antigravity"
os.environ["JWT_EXPIRY_MINUTES"] = "60"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"

from app.middleware.rate_limiter import limiter
# Disable rate limiting for entire test suite
limiter.enabled = False

import app.database.connection as db_conn
from app.main import app
from app.auth.password import hash_password
from app.auth.jwt_handler import create_access_token


class MockGridFS:
    """In-memory Mock for GridFS storage during tests."""
    def __init__(self):
        self.files = {}

    def put(self, data, filename=None, content_type=None):
        file_id = ObjectId()
        self.files[str(file_id)] = {
            "data": data if isinstance(data, bytes) else str(data).encode("utf-8"),
            "filename": filename,
            "content_type": content_type,
        }
        return file_id

    def get(self, file_id):
        file_key = str(file_id)
        if file_key not in self.files:
            raise Exception("File not found")
        item = self.files[file_key]
        obj = types.SimpleNamespace()
        obj.read = lambda: item["data"]
        obj.content_type = item["content_type"]
        obj.filename = item["filename"]
        return obj


@pytest.fixture(autouse=True)
def mock_db_and_collections(monkeypatch):
    """Fixture that replaces real MongoDB collections and GridFS with in-memory mocks."""
    limiter.enabled = False

    mock_client = mongomock.MongoClient()
    mock_database = mock_client.get_database("test_db")
    mock_leads = mock_database["leads"]
    mock_users = mock_database["users"]
    mock_fs = MockGridFS()

    # Monkeypatch the database module collections and fs
    monkeypatch.setattr(db_conn, "client", mock_client)
    monkeypatch.setattr(db_conn, "db", mock_database)
    monkeypatch.setattr(db_conn, "leads_collection", mock_leads)
    monkeypatch.setattr(db_conn, "users_collection", mock_users)
    monkeypatch.setattr(db_conn, "fs", mock_fs)

    # Also monkeypatch references imported into models/routes
    import app.models.lead as lead_model
    import app.models.user as user_model
    import app.models.analytics as analytics_model
    import app.routes.leads as leads_route
    import app.utils.seed_admin as seed_module

    monkeypatch.setattr(lead_model, "leads_collection", mock_leads)
    monkeypatch.setattr(user_model, "users_collection", mock_users)
    monkeypatch.setattr(analytics_model, "leads_collection", mock_leads)
    monkeypatch.setattr(leads_route, "fs", mock_fs)
    monkeypatch.setattr(seed_module, "users_collection", mock_users)

    # Seed default super admin for tests
    hashed = hash_password("Admin@123")
    mock_users.insert_one({
        "email": "admin@leaddesk.com",
        "password": hashed,
        "role": "super_admin",
    })

    # Seed regular admin
    mock_users.insert_one({
        "email": "manager@leaddesk.com",
        "password": hashed,
        "role": "admin",
    })

    # Seed viewer
    mock_users.insert_one({
        "email": "viewer@leaddesk.com",
        "password": hashed,
        "role": "viewer",
    })

    yield {
        "db": mock_database,
        "leads": mock_leads,
        "users": mock_users,
        "fs": mock_fs,
    }


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def super_admin_token():
    """Valid JWT token for super_admin."""
    token_data = create_access_token({"sub": "admin@leaddesk.com", "role": "super_admin"})
    return token_data["access_token"]


@pytest.fixture
def admin_token():
    """Valid JWT token for regular admin."""
    token_data = create_access_token({"sub": "manager@leaddesk.com", "role": "admin"})
    return token_data["access_token"]


@pytest.fixture
def viewer_token():
    """Valid JWT token for viewer role."""
    token_data = create_access_token({"sub": "viewer@leaddesk.com", "role": "viewer"})
    return token_data["access_token"]


@pytest.fixture
def super_admin_headers(super_admin_token):
    return {"Authorization": f"Bearer {super_admin_token}"}


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def viewer_headers(viewer_token):
    return {"Authorization": f"Bearer {viewer_token}"}
