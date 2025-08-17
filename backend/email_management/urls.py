# backend/email_management/urls.py
from django.urls import path
from . import views

app_name = "email_management"

urlpatterns = [
    # Existing email retrieval endpoints
    path("emails/", views.get_emails, name="get-emails"),
    path("emails/unread/", views.get_unread_emails, name="get-unread-emails"),
    path("emails/recent/", views.get_recent_emails, name="get-recent-emails"),
    # New email action endpoints
    path(
        "emails/<str:email_id>/mark-read/",
        views.mark_email_read,
        name="mark-email-read",
    ),
    path(
        "emails/<str:email_id>/mark-unread/",
        views.mark_email_unread,
        name="mark-email-unread",
    ),
    path("emails/<str:email_id>/reply/", views.reply_to_email, name="reply-to-email"),
    path("emails/compose/", views.compose_email, name="compose-email"),
]
