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
    path(
        "google/events/create/", views.create_google_event, name="create-google-event"
    ),
    path(
        "google/events/<str:event_id>/", views.get_google_event, name="get-google-event"
    ),
    path(
        "google/events/<str:event_id>/update/",
        views.update_google_event,
        name="update-google-event",
    ),
    path(
        "google/events/<str:event_id>/delete/",
        views.delete_google_event,
        name="delete-google-event",
    ),
    path("google/free-time/", views.find_free_time, name="find-free-time"),
]
