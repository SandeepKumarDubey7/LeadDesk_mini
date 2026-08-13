"""
Pydantic schemas for User authentication and admin management.
Handles login, registration, and user response formatting.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """Admin user roles for access control."""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    VIEWER = "viewer"


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
    role: str


class RegisterRequest(BaseModel):
    """Schema for creating a new admin user (super_admin only)."""
    email: EmailStr = Field(
        ...,
        description="New admin email address",
        examples=["newadmin@leaddesk.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Password for the new admin",
    )
    role: UserRole = Field(
        default=UserRole.ADMIN,
        description="Role for the new admin user",
    )


class UserResponse(BaseModel):
    """Schema for user data in API responses."""
    id: str = Field(..., alias="_id")
    email: str
    role: str

    model_config = {"populate_by_name": True}


class UserRoleUpdate(BaseModel):
    """Schema for updating user role."""
    role: UserRole = Field(
        ...,
        description="New role for the user",
    )
