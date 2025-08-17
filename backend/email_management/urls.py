# backend/email_management/urls.py
from django.urls import path
from . import views

app_name = "email_management"

urlpatterns = [
    path("emails/", views.get_emails, name="get-emails"),
    path("emails/unread/", views.get_unread_emails, name="get-unread-emails"),
    path("emails/recent/", views.get_recent_emails, name="get-recent-emails"),
]
