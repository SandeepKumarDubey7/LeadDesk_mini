"""
CSV and Excel lead export tests.
"""

def test_export_csv(client, admin_headers):
    """Test exporting leads as CSV."""
    # Insert sample lead
    client.post(
        "/api/leads",
        data={
            "name": "Export User",
            "email": "export@example.com",
            "budget": "< ₹25k",
            "message": "Testing CSV export functionality.",
        },
    )

    response = client.get("/api/leads/export?format=csv", headers=admin_headers)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "Export User" in response.text
    assert "export@example.com" in response.text


def test_export_xlsx(client, admin_headers):
    """Test exporting leads as Excel file."""
    response = client.get("/api/leads/export?format=xlsx", headers=admin_headers)
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert len(response.content) > 0
