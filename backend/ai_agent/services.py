# backend/ai_agent/services.py
from openai import OpenAI
import json
import pytz
from django.conf import settings
from django.utils import timezone
from .models import ChatMessage, Conversation, AICommand
from calendar_management.models import CalendarEvent
from task_management.models import Task
from email_management.models import Email
from datetime import timedelta


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

    def get_user_context(self):
        """Get current user's data for AI context"""
        # Get current time in user's timezone
        user_now = self.get_user_local_time()
        user_today = user_now.date()

        # Get events from the last 2 days and next 2 days (in user's timezone)
        start_date = user_today - timedelta(days=2)
        end_date = user_today + timedelta(days=2)

        # Convert user timezone dates to UTC for database query
        start_datetime = self.user_tz.localize(
            timezone.datetime.combine(start_date, timezone.datetime.min.time())
        ).astimezone(pytz.UTC)
        end_datetime = self.user_tz.localize(
            timezone.datetime.combine(end_date, timezone.datetime.max.time())
        ).astimezone(pytz.UTC)

        recent_events = CalendarEvent.objects.filter(
            user=self.user,
            start_time__gte=start_datetime,
            start_time__lte=end_datetime,
        ).order_by("start_time")

        # Get pending tasks
        pending_tasks_queryset = Task.objects.filter(
            user=self.user, status="pending"
        ).order_by("priority", "due_date")[:5]

        # Get recent unread emails (if any)
        unread_emails = (
            Email.objects.filter(account__user=self.user, is_read=False)[:3]
            if hasattr(self.user, "email_accounts")
            else []
        )

        context = {
            "current_time": user_now.strftime("%Y-%m-%d %H:%M:%S %Z"),
            "current_date": user_today.strftime("%Y-%m-%d"),
            "timezone": str(self.user_tz),
            "recent_events": [
                {
                    "title": event.title,
                    "date": event.start_time.astimezone(self.user_tz).strftime(
                        "%Y-%m-%d"
                    ),
                    "start_time": event.start_time.astimezone(self.user_tz).strftime(
                        "%H:%M"
                    ),
                    "location": event.location or "No location",
                    "is_today": event.start_time.astimezone(self.user_tz).date()
                    == user_today,
                    "is_yesterday": event.start_time.astimezone(self.user_tz).date()
                    == (user_today - timedelta(days=1)),
                    "is_tomorrow": event.start_time.astimezone(self.user_tz).date()
                    == (user_today + timedelta(days=1)),
                }
                for event in recent_events
            ],
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
            "unread_emails_count": len(unread_emails),
        }

        return context

    def generate_response(self, user_message, conversation_id=None):
        """Generate AI response using OpenAI"""
        try:
            # Get user context
            context = self.get_user_context()

            # Organize events by date for the prompt
            todays_events = [e for e in context["recent_events"] if e["is_today"]]
            yesterdays_events = [
                e for e in context["recent_events"] if e["is_yesterday"]
            ]
            tomorrows_events = [e for e in context["recent_events"] if e["is_tomorrow"]]

            # Create system prompt with user data
            system_prompt = f"""You are a helpful AI personal assistant. You have access to the user's current data:

Current Time: {context['current_time']}
Current Date: {context['current_date']}
User Timezone: {context['timezone']}

CALENDAR EVENTS:

Yesterday's Events:
{json.dumps(yesterdays_events, indent=2) if yesterdays_events else 'No events yesterday'}

Today's Events:
{json.dumps(todays_events, indent=2) if todays_events else 'No events scheduled today'}

Tomorrow's Events:  
{json.dumps(tomorrows_events, indent=2) if tomorrows_events else 'No events scheduled tomorrow'}

PENDING TASKS:
{json.dumps(context['pending_tasks'], indent=2) if context['pending_tasks'] else 'No pending tasks'}

Unread Emails: {context['unread_emails_count']}

You can help with:
- Answering questions about their schedule and tasks
- Providing productivity advice
- Helping organize their day
- General conversation

Be helpful, concise, and reference their actual data when relevant. All times shown are in the user's local timezone ({context['timezone']}). When they ask about their calendar, include relevant events from yesterday, today, and tomorrow as appropriate."""

            # Get recent conversation context
            recent_messages = []
            if conversation_id:
                try:
                    conversation = Conversation.objects.get(
                        id=conversation_id, user=self.user
                    )
                    recent_messages = ChatMessage.objects.filter(
                        conversation=conversation
                    ).order_by("-created_at")[:10][
                        ::-1
                    ]  # Last 10 messages, oldest first
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
                max_tokens=500,
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
