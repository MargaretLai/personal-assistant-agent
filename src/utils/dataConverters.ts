// src/utils/dataConverters.ts
import { CalendarEvent, Task, Email } from "../types";

// Convert API calendar event to frontend format
export const convertApiEventToFrontend = (apiEvent: any): CalendarEvent => {
  return {
    id: apiEvent.id?.toString() || "",
    title: apiEvent.title || "",
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
    id: apiTask.id?.toString() || "", // Fixed: Safe conversion with fallback
    title: apiTask.title || "",
    completed: apiTask.status === "completed",
    priority: (apiTask.priority as "high" | "medium" | "low") || "medium",
    dueDate: apiTask.due_date ? new Date(apiTask.due_date) : undefined,
    description: apiTask.description || undefined,
  };
};

// Convert frontend task to API format - Fixed to handle partial tasks
export const convertFrontendTaskToApi = (task: Partial<Task>) => {
  const apiTask: any = {};

  // Only include defined values
  if (task.title !== undefined) apiTask.title = task.title;
  if (task.description !== undefined) apiTask.description = task.description;
  if (task.priority !== undefined) apiTask.priority = task.priority;

  // Convert completed boolean to status
  if (task.completed !== undefined) {
    apiTask.status = task.completed ? "completed" : "pending";
  }

  // Handle date safely
  if (task.dueDate !== undefined && task.dueDate !== null) {
    apiTask.due_date = task.dueDate.toISOString();
  }

  // Set estimated_hours to undefined if not provided
  apiTask.estimated_hours = task.estimatedHours || undefined;

  return apiTask;
};

// Convert API email response to frontend Email type
export const convertApiEmailToFrontend = (apiEmail: any): Email => {
  return {
    id: apiEmail.id?.toString() || "",
    subject: apiEmail.subject || "No Subject",
    sender: apiEmail.sender || "Unknown Sender",
    recipient: apiEmail.recipient || "",
    body: apiEmail.body || "",
    timestamp: apiEmail.timestamp ? new Date(apiEmail.timestamp) : new Date(),
    isRead: apiEmail.isRead || false,
    isImportant: apiEmail.isImportant || false,
    threadId: apiEmail.threadId || undefined,
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
