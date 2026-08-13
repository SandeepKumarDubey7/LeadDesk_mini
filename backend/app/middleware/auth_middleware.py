"""
Authentication middleware for protecting admin API endpoints.
Extracts and validates JWT from the Authorization header.
Supports role-based access control.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt_handler import verify_access_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that validates the JWT token from the Authorization header.

    Raises:
        HTTPException 401: If token is missing, invalid, or expired.

    Returns:
        Decoded JWT payload containing the user email and role.
    """
    token = credentials.credentials
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "email": email,
        "role": payload.get("role", "admin"),
    }


def require_role(*allowed_roles: str):
    """
    Factory for a FastAPI dependency that enforces role-based access.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("super_admin"))])

    Args:
        allowed_roles: One or more role strings that are allowed access.

    Returns:
        A dependency function that checks the current user role.
    """
    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker
