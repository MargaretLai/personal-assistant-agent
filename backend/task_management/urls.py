# backend/task_management/urls.py
from django.urls import path
from . import views

app_name = "task_management"

urlpatterns = [
    path("tasks/", views.TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", views.TaskDetailView.as_view(), name="task-detail"),
    path(
        "tasks/<int:task_id>/complete/", views.mark_task_complete, name="mark-complete"
    ),
    path("tasks/pending/", views.pending_tasks, name="pending-tasks"),
    path("tasks/stats/", views.task_stats, name="task-stats"),
    path(
        "categories/",
        views.TaskCategoryListCreateView.as_view(),
        name="category-list-create",
    ),
]
