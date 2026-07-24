"""
Dashboard routes for admin statistics.
"""

from fastapi import APIRouter, Depends
from app.models.lead import get_lead_stats
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    summary="Dashboard Statistics",
    description="Protected endpoint. Returns lead count statistics for the admin dashboard.",
    responses={
        200: {"description": "Dashboard statistics returned"},
        401: {"description": "Unauthorized"},
    },
)
async def dashboard_stats(
    _current_user: dict = Depends(get_current_user),
):
    """
    Fetch aggregated lead statistics for the admin dashboard.
    Returns total, new, contacted, and closed lead counts.
    """
    stats = get_lead_stats()
    return {
        "total": stats["total"],
        "new": stats["new"],
        "contacted": stats["contacted"],
        "closed": stats["closed"],
    }
