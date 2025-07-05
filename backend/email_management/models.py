# backend/email_management/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class EmailAccount(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="email_accounts"
    )
    email_address = models.EmailField()
    provider = models.CharField(max_length=50, default="gmail")  # gmail, outlook, etc.
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "email_address"]

    def __str__(self):
        return f"{self.email_address} ({self.user.username})"


class Email(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
    ]

    account = models.ForeignKey(
        EmailAccount, on_delete=models.CASCADE, related_name="emails"
    )
    gmail_message_id = models.CharField(max_length=200, unique=True)
    thread_id = models.CharField(max_length=200, blank=True, null=True)
    subject = models.CharField(max_length=500)
    sender_email = models.EmailField()
    sender_name = models.CharField(max_length=200, blank=True, null=True)
    recipient_emails = models.JSONField(default=list)  # List of recipient emails
    body_text = models.TextField(blank=True, null=True)
    body_html = models.TextField(blank=True, null=True)
    snippet = models.CharField(max_length=300, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="normal"
    )
    received_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-received_at"]

    def __str__(self):
        return f"{self.subject} from {self.sender_email}"

    @property
    def is_recent(self):
        return (timezone.now() - self.received_at).days < 7

    @property
    def sender_display(self):
        return self.sender_name if self.sender_name else self.sender_email


class EmailLabel(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name="labels")
    name = models.CharField(max_length=100)
    gmail_label_id = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        unique_together = ["email", "name"]

    def __str__(self):
        return f"{self.email.subject} - {self.name}"
