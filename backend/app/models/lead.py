"""
Lead model helpers for MongoDB document operations.
Handles CRUD operations on the leads collection.
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
    document = {
        **lead_data,
        "status": "New",
        "created_at": datetime.now(timezone.utc).isoformat(),
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
    Search leads by name/email with optional status and budget filters.
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


def update_lead_status(lead_id: str, new_status: str) -> bool:
    """
    Update the status of a lead by its ObjectId.

    Returns:
        True if a document was modified, False otherwise.
    """
    result = leads_collection.update_one(
        {"_id": ObjectId(lead_id)},
        {"$set": {"status": new_status}},
    )
    return result.modified_count > 0


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
