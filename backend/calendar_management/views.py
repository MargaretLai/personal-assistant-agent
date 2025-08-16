# backend/calendar_management/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from .models import CalendarEvent
from .serializers import CalendarEventSerializer, CalendarEventCreateSerializer
from .google_calendar_service import GoogleCalendarService


class CalendarEventListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CalendarEventCreateSerializer
        return CalendarEventSerializer

    def get_queryset(self):
        # First get local events
        queryset = CalendarEvent.objects.filter(user=self.request.user)

        # Optional filtering
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_time__lte=end_date)

        return queryset.order_by("start_time")

    def list(self, request, *args, **kwargs):
        """Override to include Google Calendar events"""
        try:
            # Get local events
            local_events = self.get_queryset()
            local_serializer = self.get_serializer(local_events, many=True)

            # Get Google Calendar events
            google_service = GoogleCalendarService(request.user)
            google_events = google_service.get_events()

            # Convert Google events to our format
            converted_google_events = []
            for g_event in google_events:
                converted_event = self._convert_google_event(g_event)
                if converted_event:
                    converted_google_events.append(converted_event)

            # Combine both sources
            all_events = local_serializer.data + converted_google_events

            # Sort by start time
            all_events.sort(key=lambda x: x["start_time"])

            return Response({"count": len(all_events), "results": all_events})

        except Exception as e:
            # If Google Calendar fails, return local events only
            print(f"Google Calendar error: {e}")
            return super().list(request, *args, **kwargs)

    def _convert_google_event(self, google_event):
        """Convert Google Calendar event to our API format"""
        try:
            # Handle start/end time formats
            start = google_event.get("start", {})
            end = google_event.get("end", {})

            # Parse start time
            if "dateTime" in start:
                start_time = start["dateTime"]
            elif "date" in start:
                start_time = start["date"] + "T00:00:00Z"
            else:
                return None

            # Parse end time
            if "dateTime" in end:
                end_time = end["dateTime"]
            elif "date" in end:
                end_time = end["date"] + "T23:59:59Z"
            else:
                return None

            return {
                "id": f"google_{google_event['id']}",
                "title": google_event.get("summary", "No Title"),
                "description": google_event.get("description", ""),
                "location": google_event.get("location", ""),
                "start_time": start_time,
                "end_time": end_time,
                "priority": "medium",
                "is_all_day": "date" in start,
                "google_event_id": google_event["id"],
                "is_google_event": True,  # Flag to identify Google events
            }
        except Exception as e:
            print(f"Error converting Google event: {e}")
            return None

    def perform_create(self, serializer):
        """This method is called when creating a new object"""
        serializer.save(user=self.request.user)


class CalendarEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CalendarEvent.objects.filter(user=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def todays_events(request):
    """Get today's calendar events from both local and Google Calendar"""
    try:
        # Get local events
        today = timezone.now().date()
        local_events = CalendarEvent.objects.filter(
            user=request.user, start_time__date=today
        ).order_by("start_time")

        local_serializer = CalendarEventSerializer(local_events, many=True)

        # Get Google Calendar events for today
        google_service = GoogleCalendarService(request.user)
        google_events = google_service.get_todays_events()

        # Convert Google events
        converted_google_events = []
        for g_event in google_events:
            converted_event = CalendarEventListCreateView()._convert_google_event(
                g_event
            )
            if converted_event:
                converted_google_events.append(converted_event)

        # Combine and sort
        all_events = local_serializer.data + converted_google_events
        all_events.sort(key=lambda x: x["start_time"])

        return Response({"count": len(all_events), "events": all_events})

    except Exception as e:
        print(f"Error fetching today's events: {e}")
        # Fallback to local events only
        local_events = CalendarEvent.objects.filter(
            user=request.user, start_time__date=timezone.now().date()
        ).order_by("start_time")

        serializer = CalendarEventSerializer(local_events, many=True)
        return Response({"count": local_events.count(), "events": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def upcoming_events(request):
    """Get upcoming events (next 7 days)"""
    try:
        now = timezone.now()
        next_week = now + timedelta(days=7)

        # Get local events
        local_events = CalendarEvent.objects.filter(
            user=request.user, start_time__gte=now, start_time__lte=next_week
        ).order_by("start_time")

        local_serializer = CalendarEventSerializer(local_events, many=True)

        # Get Google Calendar events
        google_service = GoogleCalendarService(request.user)
        google_events = google_service.get_events(days_ahead=7)

        # Convert Google events
        converted_google_events = []
        for g_event in google_events:
            converted_event = CalendarEventListCreateView()._convert_google_event(
                g_event
            )
            if converted_event:
                converted_google_events.append(converted_event)

        # Combine and sort
        all_events = local_serializer.data + converted_google_events
        all_events.sort(key=lambda x: x["start_time"])

        return Response({"count": len(all_events), "events": all_events})

    except Exception as e:
        print(f"Error fetching upcoming events: {e}")
        # Fallback to local events only
        local_events = CalendarEvent.objects.filter(
            user=request.user, start_time__gte=now, start_time__lte=next_week
        ).order_by("start_time")

        serializer = CalendarEventSerializer(local_events, many=True)
        return Response({"count": local_events.count(), "events": serializer.data})
