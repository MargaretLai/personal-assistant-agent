# backend/email_management/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime
from .models import Email, EmailAccount
from .gmail_service import GmailService
import dateutil.parser


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_emails(request):
    """Get emails from Gmail"""
    try:
        gmail_service = GmailService(request.user)

        # Get query parameters
        max_results = int(request.query_params.get("max_results", 20))
        query = request.query_params.get("query", "")

        # Fetch messages from Gmail
        gmail_messages = gmail_service.get_messages(
            max_results=max_results, query=query
        )

        # Parse and format messages
        formatted_emails = []
        for msg in gmail_messages:
            parsed_msg = gmail_service.parse_message(msg)
            formatted_email = {
                "id": parsed_msg["id"],
                "subject": parsed_msg["subject"],
                "sender": parsed_msg["sender"],
                "snippet": parsed_msg["snippet"],
                "body": parsed_msg["body"],
                "date": parsed_msg["date"],
                "is_read": not parsed_msg["is_unread"],
                "thread_id": parsed_msg["thread_id"],
                "is_gmail": True,  # Flag to identify Gmail messages
            }
            formatted_emails.append(formatted_email)

        return Response({"count": len(formatted_emails), "emails": formatted_emails})

    except Exception as e:
        print(f"Gmail error: {e}")
        return Response(
            {"error": f"Failed to fetch emails: {str(e)}", "count": 0, "emails": []},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_unread_emails(request):
    """Get unread emails from Gmail"""
    try:
        gmail_service = GmailService(request.user)

        # Get unread messages
        gmail_messages = gmail_service.get_unread_messages(max_results=10)

        # Parse and format messages
        formatted_emails = []
        for msg in gmail_messages:
            parsed_msg = gmail_service.parse_message(msg)
            formatted_email = {
                "id": parsed_msg["id"],
                "subject": parsed_msg["subject"],
                "sender": parsed_msg["sender"],
                "snippet": parsed_msg["snippet"],
                "body": parsed_msg["body"],
                "date": parsed_msg["date"],
                "is_read": False,
                "thread_id": parsed_msg["thread_id"],
                "is_gmail": True,
            }
            formatted_emails.append(formatted_email)

        return Response({"count": len(formatted_emails), "emails": formatted_emails})

    except Exception as e:
        print(f"Gmail error: {e}")
        return Response(
            {
                "error": f"Failed to fetch unread emails: {str(e)}",
                "count": 0,
                "emails": [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_recent_emails(request):
    """Get recent emails for preview (last 5 unread)"""
    try:
        gmail_service = GmailService(request.user)

        # Get recent unread messages
        gmail_messages = gmail_service.get_unread_messages(max_results=5)

        # Parse and format messages
        formatted_emails = []
        for msg in gmail_messages:
            parsed_msg = gmail_service.parse_message(msg)

            # Try to parse the date
            try:
                if parsed_msg["date"]:
                    parsed_date = dateutil.parser.parse(parsed_msg["date"])
                else:
                    parsed_date = timezone.now()
            except:
                parsed_date = timezone.now()

            formatted_email = {
                "id": parsed_msg["id"],
                "subject": parsed_msg["subject"],
                "sender": parsed_msg["sender"],
                "snippet": (
                    parsed_msg["snippet"][:100] + "..."
                    if len(parsed_msg["snippet"]) > 100
                    else parsed_msg["snippet"]
                ),
                "timestamp": parsed_date.isoformat(),
                "isRead": False,
                "is_gmail": True,
            }
            formatted_emails.append(formatted_email)

        return Response({"count": len(formatted_emails), "emails": formatted_emails})

    except Exception as e:
        print(f"Gmail error: {e}")
        return Response(
            {
                "error": f"Failed to fetch recent emails: {str(e)}",
                "count": 0,
                "emails": [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
