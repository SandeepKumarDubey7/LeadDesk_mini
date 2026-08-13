"""
Lead export routes.
Export leads as CSV or Excel (XLSX) with optional filters.
"""

import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from app.models.lead import get_all_leads_filtered
from app.middleware.auth_middleware import get_current_user
from openpyxl import Workbook
from openpyxl.styles import Font

router = APIRouter(prefix="/api/leads/export", tags=["Export"])

EXPORT_COLUMNS = ["Name", "Email", "Budget", "Message", "Status", "Created At", "Attachment"]


@router.get(
    "",
    summary="Export Leads",
    description="Protected endpoint. Export leads as CSV or Excel file.",
    responses={
        200: {"description": "File download"},
        401: {"description": "Unauthorized"},
    },
)
async def export_leads(
    format: str = Query("csv", description="Export format: csv or xlsx"),
    q: str = Query("", description="Search query"),
    status: str = Query("", description="Filter by status"),
    budget: str = Query("", description="Filter by budget"),
    _current_user: dict = Depends(get_current_user),
):
    """Export all matching leads as CSV or Excel file."""
    leads = get_all_leads_filtered(query=q, status=status, budget=budget)

    if format.lower() == "xlsx":
        return _export_xlsx(leads)
    else:
        return _export_csv(leads)


def _export_csv(leads: list) -> StreamingResponse:
    """Generate CSV file from leads data."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(EXPORT_COLUMNS)

    for lead in leads:
        writer.writerow([
            lead.get("name", ""),
            lead.get("email", ""),
            lead.get("budget", ""),
            lead.get("message", ""),
            lead.get("status", ""),
            lead.get("created_at", ""),
            lead.get("attachment_filename", ""),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="leads_export.csv"'},
    )


def _export_xlsx(leads: list) -> StreamingResponse:
    """Generate Excel file from leads data."""
    wb = Workbook()
    ws = wb.active
    ws.title = "Leads"

    # Header row with styling
    ws.append(EXPORT_COLUMNS)
    bold_font = Font(bold=True)
    for cell in ws[1]:
        cell.font = bold_font

    # Data rows
    for lead in leads:
        ws.append([
            lead.get("name", ""),
            lead.get("email", ""),
            lead.get("budget", ""),
            lead.get("message", ""),
            lead.get("status", ""),
            lead.get("created_at", ""),
            lead.get("attachment_filename", ""),
        ])

    # Auto-width columns
    for col in ws.columns:
        max_length = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except Exception:
                pass
        ws.column_dimensions[col_letter].width = min(max_length + 4, 50)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="leads_export.xlsx"'},
    )
