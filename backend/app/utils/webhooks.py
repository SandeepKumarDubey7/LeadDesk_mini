"""
Webhook notification utilities for Slack and Discord.
Sends formatted messages when new leads are submitted.
Disabled by default — configure webhook URLs in .env to enable.
"""

import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")


def send_slack_notification(lead_data: dict) -> bool:
    """
    Send a formatted Slack message via webhook.

    Args:
        lead_data: Dict with lead details.

    Returns:
        True if sent successfully, False otherwise.
    """
    if not SLACK_WEBHOOK_URL:
        return False

    try:
        attachment_info = ""
        if lead_data.get("attachment_filename"):
            attachment_info = f"\n📎 *Attachment:* {lead_data['attachment_filename']}"

        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "🚀 New Lead Received!", "emoji": True},
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Name:*\n{lead_data.get('name', 'N/A')}"},
                        {"type": "mrkdwn", "text": f"*Email:*\n{lead_data.get('email', 'N/A')}"},
                        {"type": "mrkdwn", "text": f"*Budget:*\n{lead_data.get('budget', 'N/A')}"},
                        {"type": "mrkdwn", "text": f"*Status:*\n{lead_data.get('status', 'New')}"},
                    ],
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Message:*\n{lead_data.get('message', 'N/A')}{attachment_info}",
                    },
                },
                {"type": "divider"},
            ]
        }

        with httpx.Client(timeout=10) as client:
            response = client.post(SLACK_WEBHOOK_URL, json=payload)
            response.raise_for_status()

        logger.info("Slack notification sent successfully.")
        return True

    except Exception as e:
        logger.error(f"Failed to send Slack notification: {e}")
        return False


def send_discord_notification(lead_data: dict) -> bool:
    """
    Send a formatted Discord embed via webhook.

    Args:
        lead_data: Dict with lead details.

    Returns:
        True if sent successfully, False otherwise.
    """
    if not DISCORD_WEBHOOK_URL:
        return False

    try:
        fields = [
            {"name": "👤 Name", "value": lead_data.get("name", "N/A"), "inline": True},
            {"name": "📧 Email", "value": lead_data.get("email", "N/A"), "inline": True},
            {"name": "💰 Budget", "value": lead_data.get("budget", "N/A"), "inline": True},
            {"name": "📝 Message", "value": lead_data.get("message", "N/A")[:1024], "inline": False},
        ]

        if lead_data.get("attachment_filename"):
            fields.append({
                "name": "📎 Attachment",
                "value": lead_data["attachment_filename"],
                "inline": True,
            })

        payload = {
            "embeds": [
                {
                    "title": "🚀 New Lead Received!",
                    "color": 6366961,  # #6366f1 in decimal
                    "fields": fields,
                    "footer": {"text": "LeadDesk Mini"},
                }
            ]
        }

        with httpx.Client(timeout=10) as client:
            response = client.post(DISCORD_WEBHOOK_URL, json=payload)
            response.raise_for_status()

        logger.info("Discord notification sent successfully.")
        return True

    except Exception as e:
        logger.error(f"Failed to send Discord notification: {e}")
        return False


def send_all_notifications(lead_data: dict) -> dict:
    """
    Send notifications to all configured channels.

    Returns:
        Dict with status of each notification channel.
    """
    results = {
        "slack": send_slack_notification(lead_data),
        "discord": send_discord_notification(lead_data),
    }
    return results
