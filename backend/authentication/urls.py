# backend/authentication/urls.py
from django.urls import path
from . import views
from .oauth_views import google_oauth, authorize_google_services, google_services_status

app_name = "authentication"

urlpatterns = [
    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("profile/", views.user_profile, name="profile"),
    # Test endpoints for debugging
    path("test/", views.test_auth_working, name="test_auth_working"),
    path(
        "google-simple-test/", views.google_oauth_simple_test, name="google_simple_test"
    ),
    # OAuth URLs - Client-side OAuth
    path("google/", google_oauth, name="google_oauth_client"),
    # Google Services Authorization (separate from login)
    path(
        "google/authorize-services/",
        authorize_google_services,
        name="authorize_google_services",
    ),
    path(
        "google/services-status/", google_services_status, name="google_services_status"
    ),
]
