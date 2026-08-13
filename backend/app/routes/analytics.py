"""
Analytics routes for dashboard charts and graphs.
Protected endpoints providing aggregated lead data.
"""

from fastapi import APIRouter, Depends, Query
from app.models.analytics import get_status_distribution, get_budget_distribution, get_leads_over_time
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get(
    "/status-distribution",
    summary="Lead Status Distribution",
    description="Protected endpoint. Returns lead counts grouped by status for charts.",
)
async def status_distribution(
    _current_user: dict = Depends(get_current_user),
):
    """Get lead counts by status for doughnut chart."""
    data = get_status_distribution()
    return {"data": data}


@router.get(
    "/budget-distribution",
    summary="Lead Budget Distribution",
    description="Protected endpoint. Returns lead counts grouped by budget range for charts.",
)
async def budget_distribution(
    _current_user: dict = Depends(get_current_user),
):
    """Get lead counts by budget for bar chart."""
    data = get_budget_distribution()
    return {"data": data}


@router.get(
    "/leads-over-time",
    summary="Leads Over Time",
    description="Protected endpoint. Returns daily lead counts for the last N days.",
)
async def leads_over_time(
    days: int = Query(30, ge=7, le=365, description="Number of days to look back"),
    _current_user: dict = Depends(get_current_user),
):
    """Get daily lead counts for line chart."""
    data = get_leads_over_time(days=days)
    return {"data": data}
