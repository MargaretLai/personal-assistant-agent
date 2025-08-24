"""
URL configuration for ai_assistant project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# backend/ai_assistant/urls.py
from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import path, include
from django.db import connection


def health_check(request):
    return JsonResponse({"status": "ok", "message": "Django backend is running"})


def db_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        return JsonResponse({"database": "connected", "result": result})
    except Exception as e:
        return JsonResponse({"database": "error", "error": str(e)})


def google_verification(request):
    return HttpResponse("google-site-verification: google9cec98a809f186e6.html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("api.urls")),
    path("", health_check, name="health_check"),
    path("db-test/", db_check, name="db_check"),
    path(
        "google9cec98a809f186e6.html", google_verification, name="google_verification"
    ),
]
