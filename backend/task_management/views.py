# backend/task_management/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Task, TaskCategory
from .serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    TaskCategorySerializer,
)


class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskCreateSerializer
        return TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)

        # Optional filtering
        status_filter = self.request.query_params.get("status")
        priority = self.request.query_params.get("priority")
        category = self.request.query_params.get("category")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category_id=category)

        return queryset

    def perform_create(self, serializer):
        """This method is called when creating a new task"""
        serializer.save(user=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return TaskUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class TaskCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaskCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """This method is called when creating a new category"""
        serializer.save(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_task_complete(request, task_id):
    """Mark a task as completed"""
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        task.mark_completed()

        serializer = TaskSerializer(task)
        return Response(
            {"message": "Task marked as completed", "task": serializer.data}
        )
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_tasks(request):
    """Get pending tasks"""
    tasks = Task.objects.filter(user=request.user, status="pending").order_by(
        "priority", "due_date"
    )

    serializer = TaskSerializer(tasks, many=True)
    return Response({"count": tasks.count(), "tasks": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_stats(request):
    """Get task statistics"""
    user_tasks = Task.objects.filter(user=request.user)

    stats = {
        "total": user_tasks.count(),
        "completed": user_tasks.filter(status="completed").count(),
        "pending": user_tasks.filter(status="pending").count(),
        "in_progress": user_tasks.filter(status="in_progress").count(),
        "overdue": sum(1 for task in user_tasks if task.is_overdue),
        "high_priority": user_tasks.filter(priority="high", status="pending").count(),
    }

    if stats["total"] > 0:
        stats["completion_rate"] = round((stats["completed"] / stats["total"]) * 100, 1)
    else:
        stats["completion_rate"] = 0

    return Response(stats)
