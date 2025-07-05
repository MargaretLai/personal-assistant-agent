# backend/task_management/admin.py
from django.contrib import admin
from .models import Task, TaskCategory


@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "color"]
    list_filter = ["user"]
    search_fields = ["name"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "priority", "status", "due_date", "is_overdue"]
    list_filter = ["priority", "status", "category", "due_date", "user"]
    search_fields = ["title", "description"]
    date_hierarchy = "due_date"
    readonly_fields = ["created_at", "updated_at", "completed_at"]

    fieldsets = (
        ("Task Details", {"fields": ("title", "description", "category")}),
        ("Settings", {"fields": ("user", "priority", "status", "due_date")}),
        (
            "Time Tracking",
            {"fields": ("estimated_hours", "actual_hours", "completed_at")},
        ),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def is_overdue(self, obj):
        return obj.is_overdue

    is_overdue.boolean = True
    is_overdue.short_description = "Overdue"
