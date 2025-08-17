# backend/ai_agent/services.py
from openai import OpenAI
import json
import pytz
from django.conf import settings
from django.utils import timezone
from .models import ChatMessage, Conversation, AICommand
from calendar_management.models import CalendarEvent
from calendar_management.google_calendar_service import GoogleCalendarService
from email_management.gmail_service import GmailService
from task_management.models import Task
from email_management.models import Email
from datetime import timedelta
from authentication.models import GoogleToken


class AIAssistantService:
    def __init__(self, user):
        self.user = user
        # Initialize OpenAI client
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # Get user's timezone
        try:
            user_timezone = user.profile.timezone
        except:
            user_timezone = "America/Chicago"  # Default to Central Time

        self.user_tz = pytz.timezone(user_timezone)

    def get_user_local_time(self):
        """Get current time in user's timezone"""
        utc_now = timezone.now()
        return utc_now.astimezone(self.user_tz)

    def get_google_calendar_events(self):
        """Get Google Calendar events for AI context"""
        try:
            # Check if user has Google authentication
            if not hasattr(self.user, 'google_token'):
                return []
            
            google_service = GoogleCalendarService(self.user)
            
            # Get today's events
            todays_events = google_service.get_todays_events()
            
            # Get upcoming events (next 3 days)
            upcoming_events = google_service.get_events(days_ahead=3)
            
            # Combine and process events
            all_events = todays_events + upcoming_events
            
            processed_events = []
            user_now = self.get_user_local_time()
            user_today = user_now.date()
            
            for event in all_events:
                # Parse Google Calendar event times
                start_str = event.get('start', {}).get('dateTime') or event.get('start', {}).get('date')
                if not start_str:
                    continue
                    
                try:
                    if 'T' in start_str:  # DateTime format
                        from dateutil import parser
                        start_time = parser.parse(start_str)
                        if start_time.tzinfo is None:
                            start_time = self.user_tz.localize(start_time)
                        else:
                            start_time = start_time.astimezone(self.user_tz)
                    else:  # Date format (all-day event)
                        from datetime import datetime
                        start_time = self.user_tz.localize(datetime.strptime(start_str, '%Y-%m-%d'))
                    
                    event_date = start_time.date()
                    
                    processed_events.append({
                        'title': event.get('summary', 'No Title'),
                        'description': event.get('description', ''),
                        'location': event.get('location', ''),
                        'date': event_date.strftime('%Y-%m-%d'),
                        'start_time': start_time.strftime('%H:%M'),
                        'is_today': event_date == user_today,
                        'is_tomorrow': event_date == (user_today + timedelta(days=1)),
                        'is_yesterday': event_date == (user_today - timedelta(days=1)),
                        'is_all_day': 'date' in event.get('start', {}),
                        'source': 'Google Calendar'
                    })
                except Exception as e:
                    print(f"Error parsing Google Calendar event: {e}")
                    continue
            
            return processed_events
            
        except Exception as e:
            print(f"Error fetching Google Calendar events: {e}")
            return []

    def get_gmail_summary(self):
        """Get Gmail summary for AI context"""
        try:
            # Check if user has Google authentication
            if not hasattr(self.user, 'google_token'):
                return {
                    'unread_count': 0,
                    'recent_emails': [],
                    'has_gmail_access': False
                }
            
            gmail_service = GmailService(self.user)
            
            # Get unread emails
            unread_messages = gmail_service.get_unread_messages(max_results=5)
            
            recent_emails = []
            for msg in unread_messages:
                parsed_msg = gmail_service.parse_message(msg)
                
                # Extract sender name from email
                sender = parsed_msg['sender']
                sender_name = sender.split('<')[0].strip() if '<' in sender else sender.split('@')[0]
                
                recent_emails.append({
                    'subject': parsed_msg['subject'],
                    'sender': sender_name,
                    'snippet': parsed_msg['snippet'][:100] + '...' if len(parsed_msg['snippet']) > 100 else parsed_msg['snippet'],
                    'date': parsed_msg['date']
                })
            
            return {
                'unread_count': len(unread_messages),
                'recent_emails': recent_emails,
                'has_gmail_access': True
            }
            
        except Exception as e:
            print(f"Error fetching Gmail data: {e}")
            return {
                'unread_count': 0,
                'recent_emails': [],
                'has_gmail_access': False,
                'error': str(e)
            }

    def get_user_context(self):
        """Get current user's data for AI context - Enhanced with Google data"""
        # Get current time in user's timezone
        user_now = self.get_user_local_time()
        user_today = user_now.date()

        # Get LOCAL calendar events (from your database)
        start_date = user_today - timedelta(days=2)
        end_date = user_today + timedelta(days=2)

        # Convert user timezone dates to UTC for database query
        start_datetime = self.user_tz.localize(
            timezone.datetime.combine(start_date, timezone.datetime.min.time())
        ).astimezone(pytz.UTC)
        end_datetime = self.user_tz.localize(
            timezone.datetime.combine(end_date, timezone.datetime.max.time())
        ).astimezone(pytz.UTC)

        local_events = CalendarEvent.objects.filter(
            user=self.user,
            start_time__gte=start_datetime,
            start_time__lte=end_datetime,
        ).order_by("start_time")

        # Process local events
        local_events_data = [
            {
                "title": event.title,
                "date": event.start_time.astimezone(self.user_tz).strftime("%Y-%m-%d"),
                "start_time": event.start_time.astimezone(self.user_tz).strftime("%H:%M"),
                "location": event.location or "No location",
                "is_today": event.start_time.astimezone(self.user_tz).date() == user_today,
                "is_yesterday": event.start_time.astimezone(self.user_tz).date() == (user_today - timedelta(days=1)),
                "is_tomorrow": event.start_time.astimezone(self.user_tz).date() == (user_today + timedelta(days=1)),
                "source": "Local Calendar"
            }
            for event in local_events
        ]

        # Get GOOGLE calendar events
        google_events_data = self.get_google_calendar_events()

        # Combine all events
        all_events = local_events_data + google_events_data

        # Get pending tasks
        pending_tasks_queryset = Task.objects.filter(
            user=self.user, status="pending"
        ).order_by("priority", "due_date")[:5]

        # Get Gmail summary
        gmail_summary = self.get_gmail_summary()

        context = {
            "current_time": user_now.strftime("%Y-%m-%d %H:%M:%S %Z"),
            "current_date": user_today.strftime("%Y-%m-%d"),
            "timezone": str(self.user_tz),
            "all_events": all_events,  # Combined local + Google events
            "local_events_count": len(local_events_data),
            "google_events_count": len(google_events_data),
            "pending_tasks": [
                {
                    "title": task.title,
                    "priority": task.priority,
                    "due_date": (
                        task.due_date.astimezone(self.user_tz).strftime("%Y-%m-%d")
                        if task.due_date
                        else "No due date"
                    ),
                }
                for task in pending_tasks_queryset
            ],
            "gmail": gmail_summary,
            "has_google_integration": hasattr(self.user, 'google_token')
        }

        return context

    def generate_response(self, user_message, conversation_id=None):
        """Generate AI response using OpenAI - Enhanced with Google data"""
        try:
            # Get user context
            context = self.get_user_context()

            # Organize events by date for the prompt
            todays_events = [e for e in context["all_events"] if e["is_today"]]
            yesterdays_events = [e for e in context["all_events"] if e["is_yesterday"]]
            tomorrows_events = [e for e in context["all_events"] if e["is_tomorrow"]]

            # Create enhanced system prompt with Google data
            google_status = "✅ Connected" if context["has_google_integration"] else "❌ Not connected"
            
            system_prompt = f"""You are a helpful AI personal assistant with access to real calendar and email data.

CURRENT STATUS:
- Current Time: {context['current_time']}
- Current Date: {context['current_date']}
- User Timezone: {context['timezone']}
- Google Integration: {google_status}

CALENDAR OVERVIEW:
- Local Events: {context['local_events_count']}
- Google Calendar Events: {context['google_events_count']}
- Total Events: {len(context['all_events'])}

YESTERDAY'S EVENTS:
{json.dumps(yesterdays_events, indent=2) if yesterdays_events else 'No events yesterday'}

TODAY'S EVENTS:
{json.dumps(todays_events, indent=2) if todays_events else 'No events scheduled today'}

TOMORROW'S EVENTS:  
{json.dumps(tomorrows_events, indent=2) if tomorrows_events else 'No events scheduled tomorrow'}

PENDING TASKS:
{json.dumps(context['pending_tasks'], indent=2) if context['pending_tasks'] else 'No pending tasks'}

EMAIL SUMMARY:
- Gmail Access: {'✅ Connected' if context['gmail']['has_gmail_access'] else '❌ Not connected'}
- Unread Emails: {context['gmail']['unread_count']}"""

            if context['gmail']['recent_emails']:
                system_prompt += f"\n- Recent Unread Emails:\n{json.dumps(context['gmail']['recent_emails'], indent=2)}"

            system_prompt += f"""

CAPABILITIES:
You can help with:
- Answering questions about their schedule (both local and Google Calendar events)
- Summarizing unread emails and email insights
- Providing productivity advice based on their actual data
- Helping organize their day
- General conversation and assistance

IMPORTANT NOTES:
- All times are in the user's local timezone ({context['timezone']})
- Events come from both local calendar and Google Calendar (marked with 'source')
- Email data is real-time from their Gmail inbox
- Be specific about data sources when relevant (e.g., "According to your Google Calendar...")
- If they ask about calendar events, include relevant events from yesterday, today, and tomorrow"""

            # Get recent conversation context
            recent_messages = []
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(
                        id=conversation_id, user=self.user
                    )
                    recent_messages = ChatMessage.objects.filter(
                        conversation=conversation
                    ).order_by("-created_at")[:10][::-1]  # Last 10 messages, oldest first
                except Conversation.DoesNotExist:
                    pass

            # Build messages for OpenAI
            messages = [{"role": "system", "content": system_prompt}]

            # Add recent conversation context
            for msg in recent_messages:
                role = "user" if msg.sender == "user" else "assistant"
                messages.append({"role": role, "content": msg.content})

            # Add current user message
            messages.append({"role": "user", "content": user_message})

            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=800,  # Increased for richer responses
                temperature=0.7,
            )

            ai_response = response.choices[0].message.content.strip()

            return {
                "success": True,
                "response": ai_response,
                "tokens_used": response.usage.total_tokens,
            }

        except Exception as e:
            print(f"AI Service Error: {e}")  # Debug logging
            return {
                "success": False,
                "response": f"I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                "error": str(e),
            }

    def save_conversation(self, user_message, ai_response, conversation_id=None):
        """Save the conversation to database"""
        try:
            # Get or create conversation
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(
                        id=conversation_id, user=self.user
                    )
                except Conversation.DoesNotExist:
                    conversation = Conversation.objects.create(
                        user=self.user,
                        title=(
                            user_message[:50] + "..."
                            if len(user_message) > 50
                            else user_message
                        ),
                    )
            else:
                conversation = Conversation.objects.create(
                    user=self.user,
                    title=(
                        user_message[:50] + "..."
                        if len(user_message) > 50
                        else user_message
                    ),
                )

            # Save user message
            user_msg = ChatMessage.objects.create(
                conversation=conversation, content=user_message, sender="user"
            )

            # Save AI response
            ai_msg = ChatMessage.objects.create(
                conversation=conversation, content=ai_response, sender="agent"
            )

            return conversation.id

        except Exception as e:
            print(f"Error saving conversation: {e}")
            return None