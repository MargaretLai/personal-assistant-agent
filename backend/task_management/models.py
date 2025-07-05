# backend/task_management/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class TaskCategory(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#00d4ff")  # Hex color
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="task_categories"
    )

    class Meta:
        verbose_name_plural = "Task Categories"
        unique_together = ["name", "user"]

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="medium"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    category = models.ForeignKey(
        TaskCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.FloatField(null=True, blank=True)
    actual_hours = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "due_date", "created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    @property
    def is_completed(self):
        return self.status == "completed"

    @property
    def is_overdue(self):
        if self.due_date and not self.is_completed:
            return self.due_date < timezone.now()
        return False

    @property
    def days_until_due(self):
        if self.due_date:
            delta = self.due_date - timezone.now()
            return delta.days
        return None

    def mark_completed(self):
        self.status = "completed"
        self.completed_at = timezone.now()
        self.save()
