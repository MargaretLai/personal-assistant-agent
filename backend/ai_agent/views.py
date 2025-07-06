# backend/ai_agent/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import AIAssistantService
from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer  # Fixed import


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Send a message to the AI assistant and get a response
    """
    user_message = request.data.get("message", "").strip()
    conversation_id = request.data.get("conversation_id")

    if not user_message:
        return Response(
            {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Initialize AI service
    ai_service = AIAssistantService(request.user)

    # Generate AI response
    ai_result = ai_service.generate_response(user_message, conversation_id)

    if not ai_result["success"]:
        return Response(
            {
                "error": "Failed to generate AI response",
                "detail": ai_result.get("error", "Unknown error"),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Save conversation
    new_conversation_id = ai_service.save_conversation(
        user_message, ai_result["response"], conversation_id
    )

    return Response(
        {
            "user_message": user_message,
            "ai_response": ai_result["response"],
            "conversation_id": new_conversation_id,
            "tokens_used": ai_result.get("tokens_used", 0),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get user's conversation history"""
    conversations = Conversation.objects.filter(user=request.user)
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """Get messages from a specific conversation"""
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        messages = ChatMessage.objects.filter(conversation=conversation).order_by(
            "created_at"
        )
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(
            {
                "conversation": ConversationSerializer(conversation).data,
                "messages": serializer.data,
            }
        )
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND
        )
