# backend/authentication/urls.py
from django.urls import path
from . import views

app_name = "authentication"

urlpatterns = [
    path("login/", views.login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout, name="logout"),
    path("profile/", views.user_profile, name="profile"),
]
