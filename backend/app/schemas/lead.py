"""
Pydantic schemas for Lead data validation.
Handles input validation, serialization, and response formatting.
Includes note and activity timeline schemas.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class BudgetRange(str, Enum):
    """Valid budget range options for lead form."""
    UNDER_25K = "< ₹25k"
    RANGE_25K_50K = "₹25k - ₹50k"
    RANGE_50K_1L = "₹50k - ₹1L"
    ABOVE_1L = "₹1L+"


class LeadStatus(str, Enum):
    """Lead lifecycle statuses."""
    NEW = "New"
    CONTACTED = "Contacted"
    CLOSED = "Closed"


class LeadCreate(BaseModel):
    """Schema for creating a new lead (public form submission)."""
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the lead",
        examples=["Sandeep Kumar"],
    )
    email: EmailStr = Field(
        ...,
        description="Email address of the lead",
        examples=["sandeep@example.com"],
    )
    budget: BudgetRange = Field(
        ...,
        description="Budget range selected by the lead",
        examples=["₹25k - ₹50k"],
    )
    message: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Message from the lead",
        examples=["I need a website for my business."],
    )

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        """Strip whitespace and validate name content."""
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.strip().lower()

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        """Strip whitespace from message."""
        return v.strip()


class LeadStatusUpdate(BaseModel):
    """Schema for updating lead status."""
    status: LeadStatus = Field(
        ...,
        description="New status for the lead",
        examples=["Contacted"],
    )


class NoteCreate(BaseModel):
    """Schema for adding a note to a lead."""
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Note text content",
        examples=["Followed up via email. Client is interested."],
    )


class NoteResponse(BaseModel):
    """Schema for a lead note in API responses."""
    id: str
    text: str
    author: str
    created_at: str


class ActivityEntry(BaseModel):
    """Schema for an activity timeline entry."""
    action: str
    detail: str
    timestamp: str
    actor: str


class LeadResponse(BaseModel):
    """Schema for lead data returned in API responses."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    budget: str
    message: str
    status: str
    created_at: str
    attachment_id: Optional[str] = None
    attachment_filename: Optional[str] = None
    notes: Optional[list[NoteResponse]] = []
    activity_timeline: Optional[list[ActivityEntry]] = []

    model_config = {"populate_by_name": True}


class LeadListResponse(BaseModel):
    """Paginated list of leads."""
    leads: list[LeadResponse]
    total: int
    page: int
    limit: int
    total_pages: int
