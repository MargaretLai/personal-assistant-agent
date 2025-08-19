# backend/authentication/oauth_views.py
import json
import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.conf import settings
from .models import GoogleToken
from datetime import datetime, timedelta
from django.utils import timezone


@api_view(["POST"])
@permission_classes([AllowAny])
def google_oauth(request):
    """
    Handle Google OAuth authentication using ID token (client-side)
    """
    try:
        # Get the ID token from the request
        id_token_str = request.data.get("id_token")
        if not id_token_str:
            return Response(
                {"error": "ID token is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID
        )

        # Check if the token was issued by Google
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        # Extract user information
        email = idinfo.get("email")
        name = idinfo.get("name", "")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        picture = idinfo.get("picture", "")
        email_verified = idinfo.get("email_verified", False)

        if not email:
            return Response(
                {"error": "Email not provided by Google"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email_verified:
            return Response(
                {"error": "Email not verified by Google"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True,
            },
        )

        # Update user info if not created (in case of changes)
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        # Create or get user profile with timezone
        try:
            from .models import UserProfile

            profile, profile_created = UserProfile.objects.get_or_create(
                user=user, defaults={"timezone": "America/Chicago"}
            )
        except Exception as e:
            print(f"Profile creation error: {e}")  # Debug log

        # Create or get auth token
        token, token_created = Token.objects.get_or_create(user=user)

        # Check if user has Google services access
        has_google_services = False
        try:
            google_token = GoogleToken.objects.get(user=user)
            has_google_services = True
        except GoogleToken.DoesNotExist:
            has_google_services = False

        return Response(
            {
                "success": True,
                "token": token.key,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "name": name,
                    "picture": picture,
                    "username": user.username,
                },
                "created": created,
                "has_google_services": has_google_services,
            }
        )

    except ValueError as e:
        return Response(
            {"error": "Invalid ID token", "detail": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        print(f"OAuth error: {e}")  # Debug log
        return Response(
            {"error": "Authentication failed", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def authorize_google_services(request):
    """
    Authorize Google services (Gmail, Calendar) using frontend-obtained authorization code
    This endpoint receives an authorization code and exchanges it for access tokens
    """
    try:
        auth_code = request.data.get("authorization_code")
        if not auth_code:
            return Response(
                {"error": "Authorization code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            "code": auth_code,
            "grant_type": "authorization_code",
            "redirect_uri": "postmessage",  # Special redirect URI for client-side flows
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()

        if "access_token" not in token_json:
            return Response(
                {"error": "Failed to exchange code for tokens", "details": token_json},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate token expiry
        expires_at = None
        if "expires_in" in token_json:
            expires_at = timezone.now() + timedelta(seconds=token_json["expires_in"])

        # Store or update Google tokens
        google_token, created = GoogleToken.objects.update_or_create(
            user=request.user,
            defaults={
                "access_token": token_json["access_token"],
                "refresh_token": token_json.get("refresh_token"),
                "token_expires_at": expires_at,
                "scope": token_json.get("scope", ""),
            },
        )

        return Response(
            {
                "success": True,
                "message": "Google services authorized successfully",
                "has_gmail": "gmail" in token_json.get("scope", "").lower(),
                "has_calendar": "calendar" in token_json.get("scope", "").lower(),
                "scopes": token_json.get("scope", "").split(),
            }
        )

    except Exception as e:
        print(f"Google services authorization error: {e}")
        return Response(
            {"error": f"Failed to authorize Google services: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def google_services_status(request):
    """
    Check if user has authorized Google services
    """
    try:
        google_token = GoogleToken.objects.get(user=request.user)

        # Check if token is still valid
        is_valid = True
        if google_token.token_expires_at:
            is_valid = timezone.now() < google_token.token_expires_at

        return Response(
            {
                "has_google_services": True,
                "is_token_valid": is_valid,
                "scopes": google_token.scope.split() if google_token.scope else [],
                "expires_at": (
                    google_token.token_expires_at.isoformat()
                    if google_token.token_expires_at
                    else None
                ),
            }
        )
    except GoogleToken.DoesNotExist:
        return Response(
            {
                "has_google_services": False,
                "is_token_valid": False,
                "scopes": [],
                "expires_at": None,
            }
        )
