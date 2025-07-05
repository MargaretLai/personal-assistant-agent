# backend/ai_agent/serializers.py
from rest_framework import serializers
from .models import Conversation, ChatMessage, AICommand, UserPreference


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "content", "sender", "message_type", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.ReadOnlyField()
    last_message_time = serializers.ReadOnlyField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "messages",
            "message_count",
            "last_message_time",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.ReadOnlyField()
    last_message_time = serializers.ReadOnlyField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "message_count",
            "last_message_time",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AICommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICommand
        fields = [
            "id",
            "command_type",
            "original_text",
            "parsed_intent",
            "status",
            "result",
            "error_message",
            "processing_time",
            "created_at",
            "completed_at",
        ]
        read_only_fields = ["id", "created_at", "completed_at"]


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            "preferred_ai_model",
            "timezone",
            "notification_settings",
            "privacy_settings",
            "custom_commands",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["content", "sender", "message_type", "metadata"]
