"""
Email notification service for LeadDesk Mini.
Sends HTML email notifications when new leads are submitted.
Disabled by default — configure SMTP settings in .env to enable.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")


def is_email_configured() -> bool:
    """Check if SMTP settings are configured."""
    return all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, NOTIFY_EMAIL])


def send_new_lead_notification(lead_data: dict) -> bool:
    """
    Send an HTML email notification about a new lead.

    Args:
        lead_data: Dict with name, email, budget, message, status, created_at.

    Returns:
        True if email was sent, False otherwise.
    """
    if not is_email_configured():
        logger.info("SMTP not configured — skipping email notification.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚀 New Lead: {lead_data.get('name', 'Unknown')}"
        msg["From"] = SMTP_USER
        msg["To"] = NOTIFY_EMAIL

        html_body = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background: #f1f5f9; padding: 32px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6366f1, #0ea5e9); padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">🚀 New Lead Received!</h1>
                </div>
                <div style="padding: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 100px;">Name</td>
                            <td style="padding: 8px 0; color: #1e293b;">{lead_data.get('name', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email</td>
                            <td style="padding: 8px 0; color: #1e293b;">{lead_data.get('email', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Budget</td>
                            <td style="padding: 8px 0; color: #6366f1; font-weight: 600;">{lead_data.get('budget', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Attachment</td>
                            <td style="padding: 8px 0; color: #1e293b;">{lead_data.get('attachment_filename', 'None')}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <p style="margin: 0 0 4px; font-weight: 600; color: #64748b; font-size: 13px;">Message</p>
                        <p style="margin: 0; color: #1e293b; line-height: 1.6;">{lead_data.get('message', 'N/A')}</p>
                    </div>
                </div>
                <div style="padding: 16px 24px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">LeadDesk Mini — Lead Capture Platform</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email notification sent for lead: {lead_data.get('email', 'N/A')}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
        return False
