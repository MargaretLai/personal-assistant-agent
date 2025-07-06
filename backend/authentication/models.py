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
