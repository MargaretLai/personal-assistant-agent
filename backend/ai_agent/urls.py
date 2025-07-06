# backend/ai_agent/urls.py
from django.urls import path
from . import views

app_name = "ai_agent"

urlpatterns = [
    path("chat/", views.chat_with_ai, name="chat"),
    path("conversations/", views.get_conversations, name="conversations"),
    path(
        "conversations/<int:conversation_id>/",
        views.get_conversation_messages,
        name="conversation-detail",
    ),
]
