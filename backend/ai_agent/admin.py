# backend/ai_agent/admin.py
from django.contrib import admin
from .models import Conversation, ChatMessage, AICommand, UserPreference


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "message_count", "last_message_time"]
    list_filter = ["created_at", "user"]
    search_fields = ["title", "user__username"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = [
        "conversation",
        "sender",
        "content_preview",
        "message_type",
        "created_at",
    ]
    list_filter = ["sender", "message_type", "created_at"]
    search_fields = ["content", "conversation__user__username"]
    readonly_fields = ["created_at"]

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content Preview"


@admin.register(AICommand)
class AICommandAdmin(admin.ModelAdmin):
    list_display = ["command_type", "user", "status", "processing_time", "created_at"]
    list_filter = ["command_type", "status", "created_at"]
    search_fields = ["original_text", "user__username"]
    readonly_fields = ["created_at", "completed_at"]


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ["user", "preferred_ai_model", "timezone"]
    list_filter = ["preferred_ai_model", "timezone"]
    search_fields = ["user__username"]
    readonly_fields = ["created_at", "updated_at"]
