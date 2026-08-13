"""
Analytics model helpers for MongoDB aggregation pipelines.
Provides data for charts and graphs on the admin dashboard.
"""

from datetime import datetime, timedelta, timezone
from app.database.connection import leads_collection


def get_status_distribution() -> list:
    """
    Get lead counts grouped by status for doughnut chart.

    Returns:
        List of dicts with status and count.
    """
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    results = list(leads_collection.aggregate(pipeline))
    return [{"status": r["_id"], "count": r["count"]} for r in results]


def get_budget_distribution() -> list:
    """
    Get lead counts grouped by budget range for bar chart.

    Returns:
        List of dicts with budget and count.
    """
    pipeline = [
        {"$group": {"_id": "$budget", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    results = list(leads_collection.aggregate(pipeline))
    return [{"budget": r["_id"], "count": r["count"]} for r in results]


def get_leads_over_time(days: int = 30) -> list:
    """
    Get daily lead counts for the last N days for line chart.

    Returns:
        List of dicts with date string and count.
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_iso = start_date.isoformat()

    pipeline = [
        {"$match": {"created_at": {"$gte": start_iso}}},
        {
            "$addFields": {
                "date_only": {"$substr": ["$created_at", 0, 10]}
            }
        },
        {"$group": {"_id": "$date_only", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    results = list(leads_collection.aggregate(pipeline))

    # Fill in missing dates with 0
    date_counts = {r["_id"]: r["count"] for r in results}
    filled = []
    current = start_date.date()
    end = datetime.now(timezone.utc).date()
    while current <= end:
        date_str = current.isoformat()
        filled.append({"date": date_str, "count": date_counts.get(date_str, 0)})
        current += timedelta(days=1)

    return filled
