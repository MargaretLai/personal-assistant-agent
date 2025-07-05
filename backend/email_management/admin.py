# backend/email_management/admin.py
from django.contrib import admin
from .models import EmailAccount, Email, EmailLabel


@admin.register(EmailAccount)
class EmailAccountAdmin(admin.ModelAdmin):
    list_display = ["email_address", "user", "provider", "is_active", "last_sync"]
    list_filter = ["provider", "is_active", "last_sync"]
    search_fields = ["email_address", "user__username"]
    readonly_fields = ["created_at", "last_sync"]


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = [
        "subject",
        "sender_email",
        "account",
        "is_read",
        "is_important",
        "received_at",
    ]
    list_filter = ["is_read", "is_important", "is_starred", "priority", "received_at"]
    search_fields = ["subject", "sender_email", "sender_name", "body_text"]
    date_hierarchy = "received_at"
    readonly_fields = ["created_at", "updated_at"]


@admin.register(EmailLabel)
class EmailLabelAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "gmail_label_id"]
    list_filter = ["name"]
    search_fields = ["name", "email__subject"]
