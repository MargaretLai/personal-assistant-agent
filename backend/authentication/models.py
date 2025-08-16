# backend/authentication/models.py
from django.db import models
from django.contrib.auth.models import User
import pytz


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    timezone = models.CharField(
        max_length=50,
        default="America/Chicago",
        choices=[(tz, tz) for tz in pytz.common_timezones],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.timezone}"


class GoogleToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_token')
    access_token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    scope = models.TextField()  # Store granted scopes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Google Token for {self.user.username}"