"""
Admin user management routes.
CRUD operations for admin users (super_admin only).
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.user import RegisterRequest, UserResponse, UserRoleUpdate
from app.models.user import get_user_by_email, create_user, get_all_users, update_user_role, delete_user
from app.auth.password import hash_password
from app.middleware.auth_middleware import require_role
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])


@router.post(
    "/users",
    status_code=status.HTTP_201_CREATED,
    summary="Create Admin User",
    description="Super admin only. Create a new admin user with a specific role.",
    responses={
        201: {"description": "User created successfully"},
        403: {"description": "Access denied — super_admin role required"},
        409: {"description": "User with this email already exists"},
    },
)
async def create_admin_user(
    body: RegisterRequest,
    current_user: dict = Depends(require_role("super_admin")),
):
    """Create a new admin user. Only super_admin can create users."""
    existing = get_user_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A user with email '{body.email}' already exists.",
        )

    hashed = hash_password(body.password)
    new_user = create_user(body.email, hashed, body.role.value)

    return {
        "message": "User created successfully",
        "user": {
            "_id": new_user["_id"],
            "email": new_user["email"],
            "role": new_user["role"],
        },
    }


@router.get(
    "/users",
    summary="List All Admin Users",
    description="Super admin only. Returns list of all admin users.",
    responses={
        200: {"description": "List of admin users"},
        403: {"description": "Access denied"},
    },
)
async def list_admin_users(
    current_user: dict = Depends(require_role("super_admin")),
):
    """Get all admin users. Only super_admin can list users."""
    users = get_all_users()
    return {"users": users}


@router.patch(
    "/users/{user_id}/role",
    summary="Update User Role",
    description="Super admin only. Update user role.",
    responses={
        200: {"description": "Role updated successfully"},
        403: {"description": "Access denied"},
        404: {"description": "User not found"},
    },
)
async def update_role(
    user_id: str,
    body: UserRoleUpdate,
    current_user: dict = Depends(require_role("super_admin")),
):
    """Update user role. Only super_admin can update roles."""
    try:
        ObjectId(user_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    updated = update_user_role(user_id, body.role.value)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or role unchanged",
        )

    return {
        "message": f"User role updated to '{body.role.value}'",
        "user_id": user_id,
        "new_role": body.role.value,
    }


@router.delete(
    "/users/{user_id}",
    summary="Delete Admin User",
    description="Super admin only. Delete an admin user.",
    responses={
        200: {"description": "User deleted successfully"},
        403: {"description": "Access denied"},
        404: {"description": "User not found"},
    },
)
async def remove_user(
    user_id: str,
    current_user: dict = Depends(require_role("super_admin")),
):
    """Delete an admin user. Only super_admin can delete users."""
    try:
        ObjectId(user_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    deleted = delete_user(user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {"message": "User deleted successfully", "user_id": user_id}
