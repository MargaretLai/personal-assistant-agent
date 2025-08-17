# backend/email_management/gmail_service.py
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from authentication.models import GoogleToken
import base64
import email
from email.mime.text import MIMEText
from authentication.views import refresh_google_token


class GmailService:
    def __init__(self, user):
        self.user = user
        self.service = self._get_service()

    def _get_service(self):
        """Get Gmail service with user's credentials"""
        try:
            # Refresh token if needed
            if not refresh_google_token(self.user):
                raise Exception(f"Unable to refresh Gmail token for {self.user.email}")

            google_token = GoogleToken.objects.get(user=self.user)

            credentials = Credentials(
                token=google_token.access_token,
                refresh_token=google_token.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                scopes=["https://www.googleapis.com/auth/gmail.readonly"],
            )

            service = build("gmail", "v1", credentials=credentials)
            return service

        except GoogleToken.DoesNotExist:
            raise Exception(
                f"User {self.user.email} doesn't have Google authentication. Please re-authenticate with Google."
            )
        except Exception as e:
            raise Exception(f"Failed to create Gmail service: {str(e)}")

    def get_messages(self, max_results=20, query=""):
        """Get Gmail messages"""
        try:
            # Get message list
            results = (
                self.service.users()
                .messages()
                .list(userId="me", maxResults=max_results, q=query)
                .execute()
            )

            messages = results.get("messages", [])

            # Get full message details
            detailed_messages = []
            for message in messages:
                msg = (
                    self.service.users()
                    .messages()
                    .get(userId="me", id=message["id"])
                    .execute()
                )
                detailed_messages.append(msg)

            return detailed_messages

        except Exception as e:
            raise Exception(f"Failed to fetch Gmail messages: {str(e)}")

    def get_unread_messages(self, max_results=10):
        """Get unread Gmail messages"""
        return self.get_messages(max_results=max_results, query="is:unread")

    def _decode_message_part(self, part):
        """Decode message part data"""
        if "data" in part["body"]:
            data = part["body"]["data"]
        elif "data" in part:
            data = part["data"]
        else:
            return ""

        data = data.replace("-", "+").replace("_", "/")
        return base64.b64decode(data).decode("utf-8")

    def parse_message(self, message):
        """Parse Gmail message into readable format"""
        headers = message["payload"].get("headers", [])

        # Extract headers
        subject = next(
            (h["value"] for h in headers if h["name"] == "Subject"), "No Subject"
        )
        sender = next(
            (h["value"] for h in headers if h["name"] == "From"), "Unknown Sender"
        )
        date = next((h["value"] for h in headers if h["name"] == "Date"), "")

        # Extract body
        body = ""
        if "parts" in message["payload"]:
            for part in message["payload"]["parts"]:
                if part["mimeType"] == "text/plain":
                    body = self._decode_message_part(part)
                    break
        else:
            if message["payload"]["mimeType"] == "text/plain":
                body = self._decode_message_part(message["payload"])

        return {
            "id": message["id"],
            "thread_id": message["threadId"],
            "subject": subject,
            "sender": sender,
            "date": date,
            "body": body,
            "snippet": message.get("snippet", ""),
            "is_unread": "UNREAD" in message.get("labelIds", []),
        }
