"""
Authentication routes for admin login.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.user import LoginRequest, LoginResponse
from app.models.user import get_user_by_email
from app.auth.password import verify_password
from app.auth.jwt_handler import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Admin Login",
    description="Authenticate an admin user and return a JWT access token.",
    responses={
        200: {"description": "Login successful, JWT token returned"},
        401: {"description": "Invalid email or password"},
        422: {"description": "Validation error in request body"},
    },
)
async def login(request: LoginRequest):
    """
    Authenticate admin user with email and password.
    Returns JWT access token on success, including user role.
    """
    # Find user by email
    user = get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Get user role (default to admin for backward compat)
    user_role = user.get("role", "admin")

    # Generate JWT token with role
    token_data = create_access_token(data={"sub": user["email"], "role": user_role})

    return LoginResponse(
        access_token=token_data["access_token"],
        token_type=token_data["token_type"],
        expires_in=token_data["expires_in"],
        email=user["email"],
        role=user_role,
    )
