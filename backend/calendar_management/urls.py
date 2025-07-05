# backend/calendar_management/urls.py
from django.urls import path
from . import views

app_name = "calendar_management"

urlpatterns = [
    path(
        "events/", views.CalendarEventListCreateView.as_view(), name="event-list-create"
    ),
    path(
        "events/<int:pk>/", views.CalendarEventDetailView.as_view(), name="event-detail"
    ),
    path("events/today/", views.todays_events, name="todays-events"),
    path("events/upcoming/", views.upcoming_events, name="upcoming-events"),
]
