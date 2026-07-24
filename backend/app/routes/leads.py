"""
Lead management routes.
Handles lead creation (public), listing, searching, and status updates (protected).
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.lead import LeadCreate, LeadStatusUpdate, LeadListResponse
from app.models.lead import (
    create_lead,
    get_lead_by_email,
    get_leads_paginated,
    search_leads,
    update_lead_status,
    get_lead_stats,
)
from app.middleware.auth_middleware import get_current_user
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get(
    "/public/stats",
    summary="Public Lead Stats",
    description="Returns public facing statistics for the landing page.",
)
async def public_stats():
    """Returns basic stats without auth required."""
    stats = get_lead_stats()
    return {
        "leads_captured": stats["total"],
        "businesses_helped": stats["closed"]
    }


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Submit a New Lead",
    description="Public endpoint. Captures a new lead from the landing page form.",
    responses={
        201: {"description": "Lead created successfully"},
        409: {"description": "A lead with this email already exists"},
        422: {"description": "Validation error"},
    },
)
async def submit_lead(lead: LeadCreate):
    """
    Create a new lead from the public landing page form.
    Validates input, checks for duplicate email, and stores in MongoDB.
    """
    # Check for duplicate email
    existing = get_lead_by_email(lead.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A lead with email '{lead.email}' already exists. We'll get back to you soon!",
        )

    # Create lead document
    lead_data = lead.model_dump()
    new_lead = create_lead(lead_data)

    return {
        "message": "Lead submitted successfully!",
        "lead": {
            "_id": new_lead["_id"],
            "name": new_lead["name"],
            "email": new_lead["email"],
            "budget": new_lead["budget"],
            "status": new_lead["status"],
            "created_at": new_lead["created_at"],
        },
    }


@router.get(
    "",
    response_model=LeadListResponse,
    summary="List All Leads (Paginated)",
    description="Protected endpoint. Returns paginated list of all leads.",
    responses={
        200: {"description": "Paginated leads list"},
        401: {"description": "Unauthorized — invalid or missing token"},
    },
)
async def list_leads(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Results per page"),
    _current_user: dict = Depends(get_current_user),
):
    """Fetch all leads with pagination. Requires authentication."""
    result = get_leads_paginated(page=page, limit=limit)
    return result


@router.get(
    "/search",
    response_model=LeadListResponse,
    summary="Search Leads",
    description="Protected endpoint. Search leads by name, email with optional status and budget filters.",
    responses={
        200: {"description": "Filtered and paginated search results"},
        401: {"description": "Unauthorized"},
    },
)
async def search_leads_endpoint(
    q: str = Query("", description="Search term for name or email"),
    status_filter: str = Query("", alias="status", description="Filter by status: New, Contacted, Closed"),
    budget: str = Query("", description="Filter by budget range"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Results per page"),
    _current_user: dict = Depends(get_current_user),
):
    """Search leads with multi-field filtering and pagination. Requires authentication."""
    result = search_leads(
        query=q,
        status=status_filter,
        budget=budget,
        page=page,
        limit=limit,
    )
    return result


@router.patch(
    "/{lead_id}/status",
    summary="Update Lead Status",
    description="Protected endpoint. Update a lead's status (New, Contacted, Closed).",
    responses={
        200: {"description": "Status updated successfully"},
        400: {"description": "Invalid lead ID format"},
        401: {"description": "Unauthorized"},
        404: {"description": "Lead not found"},
    },
)
async def update_status(
    lead_id: str,
    body: LeadStatusUpdate,
    _current_user: dict = Depends(get_current_user),
):
    """Update the status of a lead via dropdown selection. Requires authentication."""
    # Validate ObjectId format
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    # Update status
    updated = update_lead_status(lead_id, body.status.value)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found or status unchanged",
        )

    return {
        "message": f"Lead status updated to '{body.status.value}'",
        "lead_id": lead_id,
        "new_status": body.status.value,
    }
