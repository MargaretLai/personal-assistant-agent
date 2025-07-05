# backend/calendar_management/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class CalendarEvent(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=300, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_all_day = models.BooleanField(default=False)
    google_event_id = models.CharField(max_length=200, blank=True, null=True)  # For Google Calendar sync
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
        
    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def duration_hours(self):
        duration = self.end_time - self.start_time
        return duration.total_seconds() / 3600
    
    @property
    def is_today(self):
        return self.start_time.date() == timezone.now().date()
    
    @property
    def is_upcoming(self):
        return self.start_time > timezone.now()