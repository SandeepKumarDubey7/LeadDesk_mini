"""
Lead submission, retrieval, searching, status update, notes, and timeline tests.
"""

import io

def test_submit_lead_success(client):
    """Test public lead submission with text fields."""
    response = client.post(
        "/api/leads",
        data={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "budget": "₹25k - ₹50k",
            "message": "I want to enquire about web development services.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Lead submitted successfully!"
    assert data["lead"]["name"] == "Jane Doe"
    assert data["lead"]["email"] == "jane@example.com"
    assert data["lead"]["status"] == "New"


def test_submit_lead_with_file(client):
    """Test public lead submission with an attached PDF file."""
    fake_file = io.BytesIO(b"%PDF-1.4 test file content")
    response = client.post(
        "/api/leads",
        data={
            "name": "Alex Smith",
            "email": "alex@example.com",
            "budget": "₹50k - ₹1L",
            "message": "Here is our project RFP document attached.",
        },
        files={"attachment": ("project_spec.pdf", fake_file, "application/pdf")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["lead"]["attachment_filename"] == "project_spec.pdf"


def test_submit_duplicate_email(client):
    """Test submitting duplicate lead email raises 409 conflict."""
    client.post(
        "/api/leads",
        data={
            "name": "Duplicate User",
            "email": "dup@example.com",
            "budget": "< ₹25k",
            "message": "First inquiry message here.",
        },
    )
    # Second submission
    response = client.post(
        "/api/leads",
        data={
            "name": "Duplicate User Again",
            "email": "dup@example.com",
            "budget": "< ₹25k",
            "message": "Second inquiry message here.",
        },
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_list_leads_protected(client, admin_headers):
    """Test protected lead listing endpoint."""
    # Unauthenticated should fail
    unauth = client.get("/api/leads")
    assert unauth.status_code == 401

    # Authenticated should succeed
    auth_resp = client.get("/api/leads", headers=admin_headers)
    assert auth_resp.status_code == 200
    assert "leads" in auth_resp.json()
    assert "total" in auth_resp.json()


def test_update_lead_status(client, admin_headers, viewer_headers):
    """Test updating lead status by admin and role restriction for viewer."""
    # Create a lead
    create_res = client.post(
        "/api/leads",
        data={
            "name": "Target Lead",
            "email": "target@example.com",
            "budget": "₹1L+",
            "message": "Looking for enterprise consulting services.",
        },
    )
    lead_id = create_res.json()["lead"]["_id"]

    # Viewer should be blocked (403 Forbidden)
    viewer_res = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "Contacted"},
        headers=viewer_headers,
    )
    assert viewer_res.status_code == 403

    # Admin should succeed (200 OK)
    admin_res = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "Contacted"},
        headers=admin_headers,
    )
    assert admin_res.status_code == 200
    assert admin_res.json()["new_status"] == "Contacted"


def test_notes_and_timeline(client, admin_headers):
    """Test adding notes and viewing activity timeline for a lead."""
    create_res = client.post(
        "/api/leads",
        data={
            "name": "Timeline Lead",
            "email": "timeline@example.com",
            "budget": "₹25k - ₹50k",
            "message": "Checking out note and timeline tracking.",
        },
    )
    lead_id = create_res.json()["lead"]["_id"]

    # Add a note
    note_res = client.post(
        f"/api/leads/{lead_id}/notes",
        json={"text": "Called client, scheduled demo for Monday."},
        headers=admin_headers,
    )
    assert note_res.status_code == 200
    assert note_res.json()["note"]["text"] == "Called client, scheduled demo for Monday."

    # Get notes
    notes_list = client.get(f"/api/leads/{lead_id}/notes", headers=admin_headers)
    assert notes_list.status_code == 200
    assert len(notes_list.json()["notes"]) == 1

    # Check timeline
    timeline_res = client.get(f"/api/leads/{lead_id}/timeline", headers=admin_headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()["timeline"]
    assert len(timeline) >= 2  # Lead Created + Note Added
