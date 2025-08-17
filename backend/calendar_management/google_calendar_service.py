# backend/calendar_management/google_calendar_service.py
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from authentication.models import GoogleToken
from datetime import datetime, timedelta
from authentication.views import refresh_google_token
import pytz


class GoogleCalendarService:
    def __init__(self, user):
        self.user = user
        self.service = self._get_service()

    def _get_service(self):
        """Get Google Calendar service with user's credentials"""
        try:
            # Refresh token if needed
            if not refresh_google_token(self.user):
                raise Exception(f"Unable to refresh Google token for {self.user.email}")
            
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
            raise Exception(f"User {self.user.email} doesn't have Google authentication. Please re-authenticate with Google.")
        except Exception as e:
            raise Exception(f"Failed to create Google Calendar service: {str(e)}")

    def get_events(self, max_results=50, days_ahead=30):
        """Get calendar events from Google Calendar"""
        try:
            now = datetime.utcnow().isoformat() + "Z"
            future = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + "Z"

            events_result = (
                self.service.events()
                .list(
                    calendarId="primary",
                    timeMin=now,
                    timeMax=future,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            return events_result.get("items", [])

        except Exception as e:
            raise Exception(f"Failed to fetch calendar events: {str(e)}")

    def get_todays_events(self):
        """Get today's calendar events"""
        try:
            today = datetime.now().date()
            start_of_day = (
                datetime.combine(today, datetime.min.time()).isoformat() + "Z"
            )
            end_of_day = datetime.combine(today, datetime.max.time()).isoformat() + "Z"

            events_result = (
                self.service.events()
                .list(
                    calendarId="primary",
                    timeMin=start_of_day,
                    timeMax=end_of_day,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            return events_result.get("items", [])

        except Exception as e:
            raise Exception(f"Failed to fetch today's events: {str(e)}")

    def create_event(self, event_data):
        """Create a new Google Calendar event"""
        try:
            # Convert our event format to Google Calendar format
            google_event = {
                "summary": event_data.get("title"),
                "description": event_data.get("description", ""),
                "location": event_data.get("location", ""),
                "start": {
                    "dateTime": event_data.get("start_time"),
                    "timeZone": event_data.get("timezone", "America/Chicago"),
                },
                "end": {
                    "dateTime": event_data.get("end_time"),
                    "timeZone": event_data.get("timezone", "America/Chicago"),
                },
            }

            # Add attendees if provided
            if event_data.get("attendees"):
                google_event["attendees"] = [
                    {"email": email} for email in event_data["attendees"]
                ]

            # Add reminders
            google_event["reminders"] = {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 15},
                    {"method": "email", "minutes": 60},
                ],
            }

            event = (
                self.service.events()
                .insert(calendarId="primary", body=google_event)
                .execute()
            )

            return event

        except Exception as e:
            raise Exception(f"Failed to create Google Calendar event: {str(e)}")

    def update_event(self, event_id, event_data):
        """Update an existing Google Calendar event"""
        try:
            # Get the existing event first
            existing_event = (
                self.service.events()
                .get(calendarId="primary", eventId=event_id)
                .execute()
            )

            # Update fields that are provided
            if "title" in event_data:
                existing_event["summary"] = event_data["title"]
            if "description" in event_data:
                existing_event["description"] = event_data["description"]
            if "location" in event_data:
                existing_event["location"] = event_data["location"]
            if "start_time" in event_data:
                existing_event["start"] = {
                    "dateTime": event_data["start_time"],
                    "timeZone": event_data.get("timezone", "America/Chicago"),
                }
            if "end_time" in event_data:
                existing_event["end"] = {
                    "dateTime": event_data["end_time"],
                    "timeZone": event_data.get("timezone", "America/Chicago"),
                }

            updated_event = (
                self.service.events()
                .update(calendarId="primary", eventId=event_id, body=existing_event)
                .execute()
            )

            return updated_event

        except Exception as e:
            raise Exception(f"Failed to update Google Calendar event: {str(e)}")

    def delete_event(self, event_id):
        """Delete a Google Calendar event"""
        try:
            self.service.events().delete(
                calendarId="primary", eventId=event_id
            ).execute()

            return True

        except Exception as e:
            raise Exception(f"Failed to delete Google Calendar event: {str(e)}")

    def get_event_by_id(self, event_id):
        """Get a specific Google Calendar event by ID"""
        try:
            event = (
                self.service.events()
                .get(calendarId="primary", eventId=event_id)
                .execute()
            )

            return event

        except Exception as e:
            raise Exception(f"Failed to get Google Calendar event: {str(e)}")

    def find_free_time(self, duration_minutes=60, days_ahead=7):
        try:
            now = datetime.utcnow().replace(tzinfo=pytz.UTC)
            future = now + timedelta(days=days_ahead)
            
            # Get all events in the time range
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=now.isoformat().replace('+00:00', 'Z'),
                timeMax=future.isoformat().replace('+00:00', 'Z'),
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Find free slots
            free_slots = []
            current_time = now.replace(minute=0, second=0, microsecond=0)
            
            # Work hours: 9 AM to 6 PM
            work_start_hour = 9
            work_end_hour = 18
            
            for day in range(days_ahead + 1):
                day_start = (now + timedelta(days=day)).replace(
                    hour=work_start_hour, minute=0, second=0, microsecond=0
                )
                day_end = (now + timedelta(days=day)).replace(
                    hour=work_end_hour, minute=0, second=0, microsecond=0
                )
                
                # Skip if day_start is in the past
                if day_start < now:
                    continue
                
                # Get events for this day
                day_events = []
                for event in events:
                    event_start_str = event['start'].get('dateTime')
                    if not event_start_str:
                        continue
                        
                    # Parse event start time
                    try:
                        if event_start_str.endswith('Z'):
                            event_start = datetime.fromisoformat(event_start_str.replace('Z', '+00:00'))
                        else:
                            event_start = datetime.fromisoformat(event_start_str)
                        
                        # Ensure timezone awareness
                        if event_start.tzinfo is None:
                            event_start = pytz.UTC.localize(event_start)
                        else:
                            event_start = event_start.astimezone(pytz.UTC)
                        
                        # Check if event is on this day
                        if day_start.date() == event_start.date():
                            event_end_str = event['end'].get('dateTime')
                            if event_end_str:
                                if event_end_str.endswith('Z'):
                                    event_end = datetime.fromisoformat(event_end_str.replace('Z', '+00:00'))
                                else:
                                    event_end = datetime.fromisoformat(event_end_str)
                                
                                if event_end.tzinfo is None:
                                    event_end = pytz.UTC.localize(event_end)
                                else:
                                    event_end = event_end.astimezone(pytz.UTC)
                                
                                day_events.append({
                                    'start': event_start,
                                    'end': event_end,
                                    'title': event.get('summary', 'Busy')
                                })
                    except Exception as e:
                        print(f"Error parsing event time: {e}")
                        continue
                
                # Sort events by start time
                day_events.sort(key=lambda x: x['start'])
                
                # Find gaps between events
                current_slot_start = day_start
                
                for event in day_events:
                    # Check if there's a gap before this event
                    gap_duration = (event['start'] - current_slot_start).total_seconds() / 60
                    
                    if gap_duration >= duration_minutes:
                        free_slots.append({
                            'date': current_slot_start.strftime('%Y-%m-%d'),
                            'start_time': current_slot_start.strftime('%H:%M'),
                            'end_time': event['start'].strftime('%H:%M'),
                            'duration_minutes': int(gap_duration),
                            'suggested_duration': min(int(gap_duration), duration_minutes),
                            'start_datetime': current_slot_start.isoformat(),
                            'end_datetime': event['start'].isoformat()
                        })
                    
                    # Move to after this event
                    current_slot_start = max(current_slot_start, event['end'])
                
                # Check for time after the last event until end of work day
                if current_slot_start < day_end:
                    gap_duration = (day_end - current_slot_start).total_seconds() / 60
                    
                    if gap_duration >= duration_minutes:
                        free_slots.append({
                            'date': current_slot_start.strftime('%Y-%m-%d'),
                            'start_time': current_slot_start.strftime('%H:%M'),
                            'end_time': day_end.strftime('%H:%M'),
                            'duration_minutes': int(gap_duration),
                            'suggested_duration': min(int(gap_duration), duration_minutes),
                            'start_datetime': current_slot_start.isoformat(),
                            'end_datetime': day_end.isoformat()
                        })
            
            # Sort by date and time
            free_slots.sort(key=lambda x: x['start_datetime'])
            
            return free_slots[:10]  # Return first 10 free slots
            
        except Exception as e:
            raise Exception(f"Failed to find free time: {str(e)}")