# backend/authentication/oauth_views.py
import json
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.conf import settings


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
