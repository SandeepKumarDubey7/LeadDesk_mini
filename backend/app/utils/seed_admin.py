"""
Admin user seeder script.
Run this once to create the initial super_admin user in MongoDB.

Usage:
    cd backend
    python -m app.utils.seed_admin
"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.database.connection import users_collection
from app.auth.password import hash_password


def seed_admin():
    """Create the default super_admin user if it doesn't already exist."""
    admin_email = "admin@leaddesk.com"
    admin_password = "Admin@123"

    # Check if admin already exists
    existing = users_collection.find_one({"email": admin_email})
    if existing:
        # Ensure existing admin has role field
        if "role" not in existing:
            users_collection.update_one(
                {"email": admin_email},
                {"$set": {"role": "super_admin"}},
            )
            print(f"[OK] Admin user '{admin_email}' updated with super_admin role.")
        else:
            print(f"[OK] Admin user '{admin_email}' already exists. Skipping.")
        return

    # Hash password and create user with super_admin role
    hashed = hash_password(admin_password)
    users_collection.insert_one({
        "email": admin_email,
        "password": hashed,
        "role": "super_admin",
    })

    print(f"[SUCCESS] Super admin user created successfully!")
    print(f"   Email:    {admin_email}")
    print(f"   Password: {admin_password}")
    print(f"   Role:     super_admin")
    print(f"   [WARNING] Change the password in production!")


if __name__ == "__main__":
    seed_admin()
