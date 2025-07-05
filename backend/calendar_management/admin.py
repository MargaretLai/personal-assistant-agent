# backend/calendar_management/admin.py
from django.contrib import admin
from .models import CalendarEvent


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "start_time", "end_time", "priority", "is_all_day"]
    list_filter = ["priority", "is_all_day", "start_time", "user"]
    search_fields = ["title", "description", "location"]
    date_hierarchy = "start_time"
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Event Details", {"fields": ("title", "description", "location")}),
        ("Timing", {"fields": ("start_time", "end_time", "is_all_day")}),
        ("Settings", {"fields": ("user", "priority", "google_event_id")}),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
