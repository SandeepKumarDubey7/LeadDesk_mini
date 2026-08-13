"""
Authentication and login test suite for LeadDesk Mini.
"""

def test_login_success(client):
    """Test successful login with valid credentials."""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@leaddesk.com", "password": "Admin@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "admin@leaddesk.com"
    assert data["role"] == "super_admin"


def test_login_invalid_password(client):
    """Test login failure with wrong password."""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@leaddesk.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_invalid_email(client):
    """Test login failure with non-existent email."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@leaddesk.com", "password": "Admin@123"},
    )
    assert response.status_code == 401


def test_login_validation_error(client):
    """Test login validation with missing fields."""
    response = client.post(
        "/api/auth/login",
        json={"email": "not-an-email"},
    )
    assert response.status_code == 422
