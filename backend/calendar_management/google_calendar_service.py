# backend/calendar_management/google_calendar_service.py
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from authentication.models import GoogleToken
from datetime import datetime, timedelta
import pytz

class GoogleCalendarService:
    def __init__(self, user):
        self.user = user
        self.service = self._get_service()
    
    def _get_service(self):
        """Get Google Calendar service with user's credentials"""
        try:
            google_token = GoogleToken.objects.get(user=self.user)
            
            credentials = Credentials(
                token=google_token.access_token,
                refresh_token=google_token.refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                scopes=['https://www.googleapis.com/auth/calendar']
            )
            
            service = build('calendar', 'v3', credentials=credentials)
            return service
            
        except GoogleToken.DoesNotExist:
            raise Exception("User doesn't have Google authentication")
        except Exception as e:
            raise Exception(f"Failed to create Google Calendar service: {str(e)}")
    
    def get_events(self, max_results=50, days_ahead=30):
        """Get calendar events from Google Calendar"""
        try:
            # Get events from now to 30 days ahead
            now = datetime.utcnow().isoformat() + 'Z'
            future = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=now,
                timeMax=future,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events_result.get('items', [])
            
        except Exception as e:
            raise Exception(f"Failed to fetch calendar events: {str(e)}")
    
    def get_todays_events(self):
        """Get today's calendar events"""
        try:
            # Get today's date range
            today = datetime.now().date()
            start_of_day = datetime.combine(today, datetime.min.time()).isoformat() + 'Z'
            end_of_day = datetime.combine(today, datetime.max.time()).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=start_of_day,
                timeMax=end_of_day,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events_result.get('items', [])
            
        except Exception as e:
            raise Exception(f"Failed to fetch today's events: {str(e)}")
    
    def create_event(self, event_data):
        """Create a new calendar event"""
        try:
            event = self.service.events().insert(
                calendarId='primary',
                body=event_data
            ).execute()
            
            return event
            
        except Exception as e:
            raise Exception(f"Failed to create calendar event: {str(e)}")