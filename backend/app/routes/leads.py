"""
Lead management routes.
Handles lead creation with file upload (public), listing, searching,
status updates, notes, timeline, and file downloads (protected).
"""

import logging
from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from app.schemas.lead import LeadCreate, LeadStatusUpdate, LeadListResponse, NoteCreate, BudgetRange
from app.models.lead import (
    create_lead,
    get_lead_by_email,
    get_lead_by_id,
    get_leads_paginated,
    search_leads,
    update_lead_status,
    get_lead_stats,
    add_note_to_lead,
    get_lead_notes,
    get_lead_timeline,
)
from app.middleware.auth_middleware import get_current_user, require_role
from app.middleware.rate_limiter import limiter
from app.database.connection import fs
from app.utils.email_service import send_new_lead_notification
from app.utils.webhooks import send_all_notifications
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional
import io

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/leads", tags=["Leads"])

# Allowed file types and max size
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.get(
    "/public/stats",
    summary="Public Lead Stats",
    description="Returns public facing statistics for the landing page.",
)
@limiter.limit("30/minute")
async def public_stats(request: Request):
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
    description="Public endpoint. Captures a new lead with optional file attachment from the landing page form.",
    responses={
        201: {"description": "Lead created successfully"},
        409: {"description": "A lead with this email already exists"},
        422: {"description": "Validation error"},
    },
)
@limiter.limit("5/minute")
async def submit_lead(
    request: Request,
    name: str = Form(..., min_length=2, max_length=100),
    email: str = Form(...),
    budget: str = Form(..., min_length=1, max_length=100),
    message: str = Form(..., min_length=10, max_length=1000),
    attachment: Optional[UploadFile] = File(None),
):
    """
    Create a new lead from the public landing page form.
    Validates input, checks for duplicate email, stores file in GridFS,
    and saves lead in MongoDB.
    """
    # Normalize inputs
    email = email.strip().lower()
    name = name.strip()
    budget = budget.strip()
    message = message.strip()

    # Check for duplicate email
    existing = get_lead_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A lead with email '{email}' already exists. We will get back to you soon!",
        )

    # Handle file upload
    attachment_id = None
    attachment_filename = None

    if attachment and attachment.filename:
        # Validate file extension
        import os
        ext = os.path.splitext(attachment.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        # Read and validate file size
        file_content = await attachment.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is 5MB.",
            )

        # Store in GridFS
        file_id = fs.put(
            file_content,
            filename=attachment.filename,
            content_type=attachment.content_type or "application/octet-stream",
        )
        attachment_id = str(file_id)
        attachment_filename = attachment.filename

    # Create lead document
    lead_data = {
        "name": name,
        "email": email,
        "budget": budget,
        "message": message,
        "attachment_id": attachment_id,
        "attachment_filename": attachment_filename,
    }
    new_lead = create_lead(lead_data)

    # Send notifications (non-blocking, will not fail the request)
    try:
        send_new_lead_notification(new_lead)
        send_all_notifications(new_lead)
    except Exception as e:
        logger.error(f"Notification error (non-fatal): {e}")

    return {
        "message": "Lead submitted successfully!",
        "lead": {
            "_id": new_lead["_id"],
            "name": new_lead["name"],
            "email": new_lead["email"],
            "budget": new_lead["budget"],
            "status": new_lead["status"],
            "created_at": new_lead["created_at"],
            "attachment_filename": attachment_filename,
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
    description="Protected endpoint. Update a lead status. Viewers cannot update.",
    responses={
        200: {"description": "Status updated successfully"},
        400: {"description": "Invalid lead ID format"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden — viewer role cannot update"},
        404: {"description": "Lead not found"},
    },
)
async def update_status(
    lead_id: str,
    body: LeadStatusUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update the status of a lead via dropdown selection. Requires authentication. Viewers cannot update."""
    # Viewer role cannot update lead status
    if current_user.get("role") == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot update lead status",
        )

    # Validate ObjectId format
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    # Update status
    updated = update_lead_status(lead_id, body.status.value, current_user.get("email", "admin"))
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


# --- Notes Endpoints ---

@router.post(
    "/{lead_id}/notes",
    summary="Add Note to Lead",
    description="Protected endpoint. Add a text note to a lead.",
    responses={
        201: {"description": "Note added successfully"},
        400: {"description": "Invalid lead ID format"},
        401: {"description": "Unauthorized"},
        404: {"description": "Lead not found"},
    },
)
async def add_note(
    lead_id: str,
    body: NoteCreate,
    current_user: dict = Depends(get_current_user),
):
    """Add a note to a lead. Requires authentication."""
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    note = add_note_to_lead(lead_id, body.text, current_user.get("email", "admin"))
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return {"message": "Note added successfully", "note": note}


@router.get(
    "/{lead_id}/notes",
    summary="Get Lead Notes",
    description="Protected endpoint. Get all notes for a lead.",
)
async def list_notes(
    lead_id: str,
    _current_user: dict = Depends(get_current_user),
):
    """Get all notes for a lead. Requires authentication."""
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    notes = get_lead_notes(lead_id)
    return {"notes": notes}


@router.get(
    "/{lead_id}/timeline",
    summary="Get Lead Activity Timeline",
    description="Protected endpoint. Get the activity timeline for a lead.",
)
async def list_timeline(
    lead_id: str,
    _current_user: dict = Depends(get_current_user),
):
    """Get the activity timeline for a lead. Requires authentication."""
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    timeline = get_lead_timeline(lead_id)
    return {"timeline": timeline}


# --- File Download Endpoint ---

@router.get(
    "/{lead_id}/attachment",
    summary="Download Lead Attachment",
    description="Protected endpoint. Download the file attachment for a lead.",
)
async def download_attachment(
    lead_id: str,
    _current_user: dict = Depends(get_current_user),
):
    """Download the attached file for a lead. Requires authentication."""
    try:
        ObjectId(lead_id)
    except (InvalidId, Exception):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lead ID format",
        )

    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    attachment_id = lead.get("attachment_id")
    if not attachment_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attachment found for this lead",
        )

    try:
        grid_out = fs.get(ObjectId(attachment_id))
        content = grid_out.read()
        filename = lead.get("attachment_filename", "attachment")
        content_type = grid_out.content_type or "application/octet-stream"

        return StreamingResponse(
            io.BytesIO(content),
            media_type=content_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment file not found in storage",
        )
