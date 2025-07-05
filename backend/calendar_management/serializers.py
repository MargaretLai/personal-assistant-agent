# backend/calendar_management/serializers.py
from rest_framework import serializers
from .models import CalendarEvent


class CalendarEventSerializer(serializers.ModelSerializer):
    duration_hours = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()

    class Meta:
        model = CalendarEvent
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_time",
            "end_time",
            "priority",
            "is_all_day",
            "google_event_id",
            "duration_hours",
            "is_today",
            "is_upcoming",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        # Automatically assign the current user
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class CalendarEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            "title",
            "description",
            "location",
            "start_time",
            "end_time",
            "priority",
            "is_all_day",
        ]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data
