"""
User model helpers for MongoDB document operations.
Handles admin user lookup, creation, and role management.
"""

from bson import ObjectId
from app.database.connection import users_collection


def get_user_by_email(email: str) -> dict | None:
    """
    Find an admin user by email address.

    Args:
        email: The email to look up (case-insensitive).

    Returns:
        User document dict or None if not found.
    """
    user = users_collection.find_one({"email": email.lower()})
    if user:
        user["_id"] = str(user["_id"])
    return user


def create_user(email: str, hashed_password: str, role: str = "admin") -> dict:
    """
    Create a new admin user document.

    Args:
        email: Admin email address.
        hashed_password: bcrypt-hashed password.
        role: User role (super_admin, admin, viewer).

    Returns:
        The inserted user document with string _id.
    """
    document = {
        "email": email.lower(),
        "password": hashed_password,
        "role": role,
    }
    result = users_collection.insert_one(document)
    document["_id"] = str(result.inserted_id)
    return document


def get_all_users() -> list:
    """Get all admin users (excluding passwords)."""
    cursor = users_collection.find({}, {"password": 0})
    users = []
    for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users


def update_user_role(user_id: str, new_role: str) -> bool:
    """
    Update user role.

    Returns:
        True if a document was modified, False otherwise.
    """
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": new_role}},
    )
    return result.modified_count > 0


def delete_user(user_id: str) -> bool:
    """
    Delete a user by ID.

    Returns:
        True if a document was deleted, False otherwise.
    """
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0
