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


# Google OAuth Views
@csrf_exempt
@require_http_methods(["GET"])
def google_oauth(request):
    """Initiate Google OAuth flow"""
    google_oauth_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
        "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_OAUTH2_REDIRECT_URI,
        "scope": "openid email profile",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
    }

    authorization_url = f"{google_oauth_url}?{urlencode(params)}"
    return redirect(authorization_url)


@csrf_exempt
@require_http_methods(["GET"])
def google_oauth_callback(request):
    """Handle Google OAuth callback"""
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

        # Create or get token for API authentication
        token, token_created = Token.objects.get_or_create(user=user)

        # Log the user in for session-based auth
        django_login(request, user)

        # Redirect to frontend with token as URL parameter
        frontend_url = (
            f"{settings.FRONTEND_URL}/auth/success?token={token.key}&user_id={user.id}"
        )
        return redirect(frontend_url)

    except Exception as e:
        # Redirect to frontend with error
        frontend_url = f"{settings.FRONTEND_URL}/auth/error?error=oauth_failed"
        return redirect(frontend_url)
