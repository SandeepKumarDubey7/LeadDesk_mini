"""
Dashboard and analytics endpoint test suite.
"""

def test_public_stats(client):
    """Test public stats endpoint."""
    response = client.get("/api/leads/public/stats")
    assert response.status_code == 200
    data = response.json()
    assert "leads_captured" in data
    assert "businesses_helped" in data


def test_dashboard_stats_protected(client, admin_headers):
    """Test protected dashboard stats endpoint."""
    unauth = client.get("/api/dashboard/stats")
    assert unauth.status_code == 401

    auth_res = client.get("/api/dashboard/stats", headers=admin_headers)
    assert auth_res.status_code == 200
    data = auth_res.json()
    assert "total" in data
    assert "new" in data
    assert "contacted" in data
    assert "closed" in data


def test_analytics_endpoints(client, admin_headers):
    """Test analytics endpoints for charts."""
    status_res = client.get("/api/analytics/status-distribution", headers=admin_headers)
    assert status_res.status_code == 200
    assert "data" in status_res.json()

    budget_res = client.get("/api/analytics/budget-distribution", headers=admin_headers)
    assert budget_res.status_code == 200
    assert "data" in budget_res.json()

    time_res = client.get("/api/analytics/leads-over-time?days=7", headers=admin_headers)
    assert time_res.status_code == 200
    assert "data" in time_res.json()
