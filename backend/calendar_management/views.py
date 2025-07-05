# backend/calendar_management/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import CalendarEvent
from .serializers import CalendarEventSerializer, CalendarEventCreateSerializer


class CalendarEventListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CalendarEventCreateSerializer
        return CalendarEventSerializer

    def get_queryset(self):
        queryset = CalendarEvent.objects.filter(user=self.request.user)

        # Optional filtering
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_time__lte=end_date)

        return queryset.order_by("start_time")

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
    """Get today's calendar events"""
    today = timezone.now().date()
    events = CalendarEvent.objects.filter(
        user=request.user, start_time__date=today
    ).order_by("start_time")

    serializer = CalendarEventSerializer(events, many=True)
    return Response({"count": events.count(), "events": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def upcoming_events(request):
    """Get upcoming events (next 7 days)"""
    now = timezone.now()
    next_week = now + timedelta(days=7)

    events = CalendarEvent.objects.filter(
        user=request.user, start_time__gte=now, start_time__lte=next_week
    ).order_by("start_time")

    serializer = CalendarEventSerializer(events, many=True)
    return Response({"count": events.count(), "events": serializer.data})
