# backend/authentication/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.shortcuts import redirect
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth import login as django_login
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import requests
from urllib.parse import urlencode
from .models import GoogleToken
from datetime import datetime, timedelta
from django.utils import timezone


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint that returns an authentication token
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Authenticate user
    user = authenticate(username=username, password=password)

    if user:
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        )
    else:
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    Registration endpoint for new users
    """
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create new user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        # Create token for new user
        token = Token.objects.create(user=user)

        return Response(
            {
                "message": "User created successfully",
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )

    except IntegrityError:
        return Response(
            {"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
def logout(request):
    """
    Logout endpoint that deletes the user's token
    """
    try:
        # Delete the user's token
        token = Token.objects.get(user=request.user)
        token.delete()

        return Response({"message": "Successfully logged out"})
    except Token.DoesNotExist:
        return Response({"message": "Already logged out"})


@api_view(["GET"])
def user_profile(request):
    """
    Get current user's profile information
    """
    user = request.user
    return Response(
        {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }
    )


# Test endpoints for debugging
@api_view(["GET"])
@permission_classes([AllowAny])
def test_auth_working(request):
    """Simple test to verify auth endpoints are working"""
    return Response(
        {
            "message": "Auth endpoints are working!",
            "available_endpoints": [
                "/api/v1/auth/login/",
                "/api/v1/auth/register/",
                "/api/v1/auth/google/",
                "/api/v1/auth/profile/",
            ],
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def google_oauth_simple_test(request):
    """Simple test for Google OAuth endpoint"""
    if request.method == "GET":
        return Response(
            {
                "message": "Google OAuth endpoint is accessible",
                "method": "GET",
                "note": "Send POST request with id_token to authenticate",
            }
        )
    elif request.method == "POST":
        id_token = request.data.get("id_token")
        return Response(
            {
                "message": "Google OAuth POST received",
                "method": "POST",
                "id_token_received": bool(id_token),
                "id_token_length": len(id_token) if id_token else 0,
                "note": "This is just a test - real OAuth logic not implemented",
            }
        )


# Server-side OAuth flow (if you still want to keep this for alternative flow)
@csrf_exempt
@require_http_methods(["GET"])
def google_oauth_redirect_flow(request):
    """Initiate server-side Google OAuth flow (alternative to client-side)"""
    google_oauth_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
        "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        "scope": "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
    }

    authorization_url = f"{google_oauth_url}?{urlencode(params)}"
    return redirect(authorization_url)


@csrf_exempt
@require_http_methods(["GET"])
def google_oauth_callback(request):
    """Handle Google OAuth callback for server-side flow"""
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "Authorization code not provided"}, status=400)

    try:
        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()

        if "access_token" not in token_json:
            return JsonResponse({"error": "Failed to get access token"}, status=400)

        # Get user info from Google
        user_info_url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token_json['access_token']}"
        user_response = requests.get(user_info_url)
        user_data = user_response.json()

        # Create or get user
        user, created = User.objects.get_or_create(
            email=user_data["email"],
            defaults={
                "username": user_data["email"],
                "first_name": user_data.get("given_name", ""),
                "last_name": user_data.get("family_name", ""),
            },
        )

        # Store Google tokens
        expires_at = None
        if "expires_in" in token_json:
            expires_at = timezone.now() + timedelta(seconds=token_json["expires_in"])

        google_token, token_created = GoogleToken.objects.update_or_create(
            user=user,
            defaults={
                "access_token": token_json["access_token"],
                "refresh_token": token_json.get("refresh_token"),
                "token_expires_at": expires_at,
                "scope": token_json.get("scope", ""),
            },
        )

        # Create or get token for API authentication
        token, api_token_created = Token.objects.get_or_create(user=user)

        # Log the user in for session-based auth
        django_login(request, user)

        # Redirect to frontend with token as URL parameter
        frontend_url = (
            f"{settings.FRONTEND_URL}/auth/success?token={token.key}&user_id={user.id}"
        )
        return redirect(frontend_url)

    except Exception as e:
        print(f"OAuth error: {e}")  # Debug log
        # Redirect to frontend with error
        frontend_url = f"{settings.FRONTEND_URL}/auth/error?error=oauth_failed"
        return redirect(frontend_url)


def refresh_google_token(user):
    """Refresh Google OAuth token if expired"""
    try:
        google_token = GoogleToken.objects.get(user=user)

        # Check if token is expired or will expire soon (within 5 minutes)
        if google_token.token_expires_at:
            from django.utils import timezone

            if timezone.now() >= google_token.token_expires_at - timedelta(minutes=5):
                print(f"DEBUG: Refreshing expired token for {user.email}")

                # Refresh the token
                refresh_data = {
                    "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
                    "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                    "refresh_token": google_token.refresh_token,
                    "grant_type": "refresh_token",
                }

                refresh_response = requests.post(
                    "https://oauth2.googleapis.com/token", data=refresh_data
                )

                if refresh_response.status_code == 200:
                    refresh_json = refresh_response.json()

                    # Update the token
                    google_token.access_token = refresh_json["access_token"]
                    if "expires_in" in refresh_json:
                        google_token.token_expires_at = timezone.now() + timedelta(
                            seconds=refresh_json["expires_in"]
                        )
                    google_token.save()

                    print(f"DEBUG: Token refreshed successfully for {user.email}")
                    return True
                else:
                    print(f"DEBUG: Token refresh failed: {refresh_response.text}")
                    return False

        return True  # Token is still valid

    except GoogleToken.DoesNotExist:
        print(f"DEBUG: No Google token found for {user.email}")
        return False
    except Exception as e:
        print(f"DEBUG: Error refreshing token: {e}")
        return False
