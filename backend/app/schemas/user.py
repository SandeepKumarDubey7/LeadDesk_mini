"""
Pydantic schemas for User authentication.
Handles login request validation and token response formatting.
"""

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema for admin login request."""
    email: EmailStr = Field(
        ...,
        description="Admin email address",
        examples=["admin@leaddesk.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Admin password",
        examples=["securepassword123"],
    )


class LoginResponse(BaseModel):
    """Schema for successful login response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    email: str
