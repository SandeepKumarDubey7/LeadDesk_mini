"""
User model helpers for MongoDB document operations.
Handles admin user lookup for authentication.
"""

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


def create_user(email: str, hashed_password: str) -> dict:
    """
    Create a new admin user document.

    Args:
        email: Admin email address.
        hashed_password: bcrypt-hashed password.

    Returns:
        The inserted user document with string _id.
    """
    document = {
        "email": email.lower(),
        "password": hashed_password,
    }
    result = users_collection.insert_one(document)
    document["_id"] = str(result.inserted_id)
    return document
