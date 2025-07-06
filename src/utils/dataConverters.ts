// src/utils/dataConverters.ts
import { CalendarEvent, Task, Email } from "../types";

// Convert API calendar event to frontend format
export const convertApiEventToFrontend = (apiEvent: any): CalendarEvent => {
  return {
    id: apiEvent.id.toString(),
    title: apiEvent.title,
    start: new Date(apiEvent.start_time),
    end: new Date(apiEvent.end_time),
    description: apiEvent.description || undefined,
    location: apiEvent.location || undefined,
  };
};

// Convert frontend calendar event to API format
export const convertFrontendEventToApi = (event: Omit<CalendarEvent, "id">) => {
  return {
    title: event.title,
    description: event.description || "",
    location: event.location || "",
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    priority: "medium" as const,
    is_all_day: false,
  };
};

// Convert API task to frontend format
export const convertApiTaskToFrontend = (apiTask: any): Task => {
  return {
    id: apiTask.id.toString(),
    title: apiTask.title,
    completed: apiTask.status === "completed",
    priority: apiTask.priority as "high" | "medium" | "low",
    dueDate: apiTask.due_date ? new Date(apiTask.due_date) : undefined,
    description: apiTask.description || undefined,
  };
};

// Convert frontend task to API format
export const convertFrontendTaskToApi = (task: Omit<Task, "id">) => {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.completed ? ("completed" as const) : ("pending" as const),
    due_date: task.dueDate ? task.dueDate.toISOString() : undefined,
    estimated_hours: undefined,
  };
};

// Helper to format API error messages
export const formatApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};
