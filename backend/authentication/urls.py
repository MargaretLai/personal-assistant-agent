# backend/authentication/urls.py
from django.urls import path
from . import views
from .oauth_views import google_oauth  # Import the client-side OAuth function

app_name = "authentication"

urlpatterns = [
    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("profile/", views.user_profile, name="profile"),
    # OAuth URLs - Now using client-side OAuth only
    path("google/", google_oauth, name="google_oauth_client"),  # Client-side OAuth endpoint
    # Remove or comment out the server-side redirect OAuth endpoints:
    # path("google/", views.google_oauth, name="google_oauth"),
    # path("google/callback/", views.google_oauth_callback, name="google_oauth_callback"),
]