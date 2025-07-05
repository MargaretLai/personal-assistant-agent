# backend/email_management/serializers.py
from rest_framework import serializers
from .models import EmailAccount, Email, EmailLabel


class EmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAccount
        fields = [
            "id",
            "email_address",
            "provider",
            "is_active",
            "last_sync",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "last_sync"]


class EmailLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLabel
        fields = ["id", "name", "gmail_label_id"]
        read_only_fields = ["id"]


class EmailSerializer(serializers.ModelSerializer):
    sender_display = serializers.ReadOnlyField()
    is_recent = serializers.ReadOnlyField()
    labels = EmailLabelSerializer(many=True, read_only=True)
    account_email = serializers.CharField(
        source="account.email_address", read_only=True
    )

    class Meta:
        model = Email
        fields = [
            "id",
            "gmail_message_id",
            "thread_id",
            "subject",
            "sender_email",
            "sender_name",
            "sender_display",
            "recipient_emails",
            "body_text",
            "body_html",
            "snippet",
            "is_read",
            "is_important",
            "is_starred",
            "priority",
            "received_at",
            "is_recent",
            "labels",
            "account_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "gmail_message_id",
            "thread_id",
            "received_at",
            "created_at",
            "updated_at",
        ]


class EmailUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Email
        fields = ["is_read", "is_important", "is_starred", "priority"]
