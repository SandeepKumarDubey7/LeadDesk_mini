"""
Super admin user management and RBAC tests.
"""

def test_admin_user_management(client, super_admin_headers, admin_headers):
    """Test user creation, listing, role update, and deletion by super_admin."""
    # Regular admin should be denied (403)
    unauthorized_res = client.post(
        "/api/admin/users",
        json={"email": "newuser@leaddesk.com", "password": "Password123", "role": "admin"},
        headers=admin_headers,
    )
    assert unauthorized_res.status_code == 403

    # Super admin creates user (201)
    create_res = client.post(
        "/api/admin/users",
        json={"email": "newuser@leaddesk.com", "password": "Password123", "role": "admin"},
        headers=super_admin_headers,
    )
    assert create_res.status_code == 201
    user_id = create_res.json()["user"]["_id"]

    # List users
    list_res = client.get("/api/admin/users", headers=super_admin_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["users"]) >= 4

    # Update role
    role_res = client.patch(
        f"/api/admin/users/{user_id}/role",
        json={"role": "viewer"},
        headers=super_admin_headers,
    )
    assert role_res.status_code == 200
    assert role_res.json()["new_role"] == "viewer"

    # Delete user
    del_res = client.delete(f"/api/admin/users/{user_id}", headers=super_admin_headers)
    assert del_res.status_code == 200
