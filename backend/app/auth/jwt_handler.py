"""
JWT token handler for LeadDesk Mini.
Creates and verifies JSON Web Tokens for admin authentication.
Includes role in token payload for role-based access control.
"""

import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret_change_in_production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", "60"))


def create_access_token(data: dict) -> dict:
    """
    Create a JWT access token with expiration.

    Args:
        data: Dictionary containing claims (e.g., {"sub": "admin@email.com", "role": "admin"})

    Returns:
        Dictionary with access_token string and expires_in (seconds).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRY_MINUTES * 60,
    }


def verify_access_token(token: str) -> dict | None:
    """
    Verify and decode a JWT access token.

    Args:
        token: The JWT token string.

    Returns:
        Decoded payload dict if valid, None if invalid or expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
