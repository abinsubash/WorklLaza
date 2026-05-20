from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import ChatRoom, Message
from worker.models import Worker
from rest_framework.response import Response
from .serializers import ChatSerializer, MessageSerializer
from user.serializers import UserSerializer
from rest_framework.views import APIView
from user.models import CustomUser as User
from django.db.models import Q
from rest_framework import status
from django.conf import settings
import jwt


JWT_SECRET_KEY = settings.JWT_SECRET_KEY

class ChatView(APIView):
    def post(self, request):
        try:
            token = request.headers.get('Authorization', '')[7:]
            decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_for_id = decoded['user_id']
            
            user_id = request.data.get('user_id')
            receiverId = request.data.get('chatReceiverId')
            
            user1 = User.objects.get(id=user_id)
            user2 = User.objects.filter(id=receiverId).first()
            
            # Get or create chat
            chat = ChatRoom.objects.filter(
                (Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1))
            ).first()
            
            if not chat and user2:
                chat = ChatRoom.objects.create(user1=user1, user2=user2)
            
            # Auto-create admin chat if user is not admin
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user and not user1.is_superuser:
                admin_chat, _ = ChatRoom.objects.get_or_create(
                    user1=user1,
                    user2=admin_user,
                    defaults={'user1': user1, 'user2': admin_user}
                )
            
            # Get all chats
            all_chats = ChatRoom.objects.filter(
                Q(user1=user1) | Q(user2=user1)
            ).distinct().order_by('-id')
            
            if not chat and all_chats.exists():
                chat = all_chats.first()
            
            if not chat:
                return Response(
                    {"error": "No chat found", "chats": [], "messages": []},
                    status=status.HTTP_200_OK
                )
            
            # Get messages
            messages = chat.messages.all().order_by('timestamp')
            
            # Determine receiver
            receiver = None
            if user_for_id == user1.id:
                receiver = user2
            elif user_for_id == user2.id:
                receiver = user1
            
            # Handle null receiver safely
            receiver_data = UserSerializer(receiver).data if receiver else {"id": None, "username": "Unknown"}
            
            return JsonResponse({
                "chat_id": chat.id,
                "receiver": receiver_data,
                "messages": MessageSerializer(messages, many=True).data,
                "chats": ChatSerializer(all_chats, many=True).data
            })
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get(self, request, chat_id):
        chat = get_object_or_404(ChatRoom, id=chat_id)
        messages = chat.messages.all().order_by("timestamp")

        return JsonResponse({
            "messages": [
                {"sender": msg.sender.id, "text": msg.text, "timestamp": msg.timestamp.strftime("%H:%M"), "image": msg.image.url if msg.image else None, }
                for msg in messages
            ]
        })
