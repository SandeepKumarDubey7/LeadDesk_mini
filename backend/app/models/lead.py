"""
Lead model helpers for MongoDB document operations.
Handles CRUD operations on the leads collection.
Includes notes, activity timeline, and analytics aggregations.
"""

from datetime import datetime, timezone
from bson import ObjectId
from app.database.connection import leads_collection
import math


def create_lead(lead_data: dict) -> dict:
    """
    Insert a new lead document into MongoDB.

    Args:
        lead_data: Validated lead data from Pydantic schema.

    Returns:
        The inserted lead document with string _id.
    """
    now = datetime.now(timezone.utc).isoformat()
    document = {
        **lead_data,
        "status": "New",
        "created_at": now,
        "notes": [],
        "activity_timeline": [
            {
                "action": "Lead Created",
                "detail": "Lead submitted via contact form",
                "timestamp": now,
                "actor": "system",
            }
        ],
    }
    result = leads_collection.insert_one(document)
    document["_id"] = str(result.inserted_id)
    return document


def get_lead_by_email(email: str) -> dict | None:
    """Check if a lead with the given email already exists."""
    lead = leads_collection.find_one({"email": email.lower()})
    if lead:
        lead["_id"] = str(lead["_id"])
    return lead


def get_lead_by_id(lead_id: str) -> dict | None:
    """Get a single lead by its ObjectId."""
    try:
        lead = leads_collection.find_one({"_id": ObjectId(lead_id)})
        if lead:
            lead["_id"] = str(lead["_id"])
        return lead
    except Exception:
        return None


def get_leads_paginated(page: int = 1, limit: int = 10) -> dict:
    """
    Fetch paginated leads sorted by created_at descending.

    Returns:
        Dict with leads list, total count, page info.
    """
    skip = (page - 1) * limit
    total = leads_collection.count_documents({})

    cursor = leads_collection.find().sort("created_at", -1).skip(skip).limit(limit)
    leads = []
    for lead in cursor:
        lead["_id"] = str(lead["_id"])
        leads.append(lead)

    return {
        "leads": leads,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": math.ceil(total / limit) if total > 0 else 1,
    }


def search_leads(
    query: str = "",
    status: str = "",
    budget: str = "",
    page: int = 1,
    limit: int = 10,
) -> dict:
    """
    Search leads by name or email with optional status and budget filters.
    Results are paginated.

    Args:
        query: Search term for name or email (case-insensitive).
        status: Filter by lead status.
        budget: Filter by budget range.
        page: Page number (1-indexed).
        limit: Results per page.

    Returns:
        Dict with matching leads, total count, and page info.
    """
    filter_conditions = []

    if query:
        filter_conditions.append({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
            ]
        })

    if status:
        filter_conditions.append({"status": status})

    if budget:
        filter_conditions.append({"budget": budget})

    mongo_filter = {"$and": filter_conditions} if filter_conditions else {}

    skip = (page - 1) * limit
    total = leads_collection.count_documents(mongo_filter)

    cursor = (
        leads_collection.find(mongo_filter)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    leads = []
    for lead in cursor:
        lead["_id"] = str(lead["_id"])
        leads.append(lead)

    return {
        "leads": leads,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": math.ceil(total / limit) if total > 0 else 1,
    }


def get_all_leads_filtered(
    query: str = "",
    status: str = "",
    budget: str = "",
) -> list:
    """
    Get all matching leads without pagination (for CSV/Excel export).

    Returns:
        List of lead documents.
    """
    filter_conditions = []

    if query:
        filter_conditions.append({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}},
            ]
        })

    if status:
        filter_conditions.append({"status": status})

    if budget:
        filter_conditions.append({"budget": budget})

    mongo_filter = {"$and": filter_conditions} if filter_conditions else {}

    cursor = leads_collection.find(mongo_filter).sort("created_at", -1)
    leads = []
    for lead in cursor:
        lead["_id"] = str(lead["_id"])
        leads.append(lead)

    return leads


def update_lead_status(lead_id: str, new_status: str, actor_email: str = "admin") -> bool:
    """
    Update the status of a lead by its ObjectId.
    Also logs the status change in the activity timeline.

    Returns:
        True if a document was modified, False otherwise.
    """
    now = datetime.now(timezone.utc).isoformat()
    result = leads_collection.update_one(
        {"_id": ObjectId(lead_id)},
        {
            "$set": {"status": new_status},
            "$push": {
                "activity_timeline": {
                    "action": "Status Changed",
                    "detail": f"Status updated to '{new_status}'",
                    "timestamp": now,
                    "actor": actor_email,
                }
            },
        },
    )
    return result.modified_count > 0


def add_note_to_lead(lead_id: str, note_text: str, author_email: str) -> dict | None:
    """
    Add a note to a lead and log in activity timeline.

    Returns:
        The created note dict, or None if lead not found.
    """
    now = datetime.now(timezone.utc).isoformat()
    note = {
        "id": str(ObjectId()),
        "text": note_text,
        "author": author_email,
        "created_at": now,
    }
    result = leads_collection.update_one(
        {"_id": ObjectId(lead_id)},
        {
            "$push": {
                "notes": note,
                "activity_timeline": {
                    "action": "Note Added",
                    "detail": f"Note added by {author_email}",
                    "timestamp": now,
                    "actor": author_email,
                },
            }
        },
    )
    if result.modified_count > 0:
        return note
    return None


def get_lead_notes(lead_id: str) -> list:
    """Get all notes for a lead."""
    lead = leads_collection.find_one(
        {"_id": ObjectId(lead_id)},
        {"notes": 1},
    )
    if lead:
        return lead.get("notes", [])
    return []


def get_lead_timeline(lead_id: str) -> list:
    """Get the activity timeline for a lead."""
    lead = leads_collection.find_one(
        {"_id": ObjectId(lead_id)},
        {"activity_timeline": 1},
    )
    if lead:
        return lead.get("activity_timeline", [])
    return []


def get_lead_stats() -> dict:
    """
    Get dashboard statistics — total leads and counts by status.

    Returns:
        Dict with total, new, contacted, closed counts.
    """
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
            }
        }
    ]
    results = list(leads_collection.aggregate(pipeline))

    stats = {"total": 0, "new": 0, "contacted": 0, "closed": 0}
    for item in results:
        status = item["_id"]
        count = item["count"]
        stats["total"] += count
        if status == "New":
            stats["new"] = count
        elif status == "Contacted":
            stats["contacted"] = count
        elif status == "Closed":
            stats["closed"] = count

    return stats
