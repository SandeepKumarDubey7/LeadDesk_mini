"""
Admin user seeder script.
Run this once to create the initial admin user in MongoDB.

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
    """Create the default admin user if it doesn't already exist."""
    admin_email = "admin@leaddesk.com"
    admin_password = "Admin@123"

    # Check if admin already exists
    existing = users_collection.find_one({"email": admin_email})
    if existing:
        print(f"[OK] Admin user '{admin_email}' already exists. Skipping.")
        return

    # Hash password and create user
    hashed = hash_password(admin_password)
    users_collection.insert_one({
        "email": admin_email,
        "password": hashed,
    })

    print(f"[SUCCESS] Admin user created successfully!")
    print(f"   Email:    {admin_email}")
    print(f"   Password: {admin_password}")
    print(f"   [WARNING] Change the password in production!")


if __name__ == "__main__":
    seed_admin()
