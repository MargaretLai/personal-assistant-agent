# backend/ai_agent/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Conversation(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations"
    )
    title = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"

    @property
    def message_count(self):
        return self.messages.count()

    @property
    def last_message_time(self):
        last_message = self.messages.last()
        return last_message.created_at if last_message else self.created_at


class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ("user", "User"),
        ("agent", "AI Agent"),
    ]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    content = models.TextField()
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message_type = models.CharField(
        max_length=50, default="text"
    )  # text, command, system
    metadata = models.JSONField(default=dict, blank=True)  # Store command results, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.get_sender_display()}: {self.content[:50]}..."


class AICommand(models.Model):
    COMMAND_TYPES = [
        ("calendar", "Calendar Management"),
        ("tasks", "Task Management"),
        ("email", "Email Management"),
        ("general", "General Query"),
        ("system", "System Command"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_commands")
    message = models.ForeignKey(
        ChatMessage, on_delete=models.CASCADE, related_name="commands"
    )
    command_type = models.CharField(max_length=20, choices=COMMAND_TYPES)
    original_text = models.TextField()
    parsed_intent = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, null=True)
    processing_time = models.FloatField(null=True, blank=True)  # seconds
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_command_type_display()} - {self.original_text[:50]}"


class UserPreference(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="ai_preferences"
    )
    preferred_ai_model = models.CharField(max_length=50, default="gpt-3.5-turbo")
    timezone = models.CharField(max_length=50, default="UTC")
    notification_settings = models.JSONField(default=dict)
    privacy_settings = models.JSONField(default=dict)
    custom_commands = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"
