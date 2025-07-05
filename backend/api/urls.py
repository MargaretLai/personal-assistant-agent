# backend/api/urls.py
from django.urls import path, include

urlpatterns = [
    path("auth/", include("authentication.urls")),
    path("calendar/", include("calendar_management.urls")),
    path("tasks/", include("task_management.urls")),
]
