// src/services/apiService.ts
import axios from "axios";

// Base API configuration
const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    } else if (
      error.response?.status === 500 &&
      error.response?.data?.error?.includes("Google authentication")
    ) {
      // Google token issue - redirect to re-authenticate
      console.log(
        "Google authentication expired, redirecting to re-authenticate..."
      );
      window.location.href = "/api/v1/auth/google/";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post("/auth/login/", credentials),

  register: (userData: {
    username: string;
    password: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }) => apiClient.post("/auth/register/", userData),

  logout: () => apiClient.post("/auth/logout/"),

  getProfile: () => apiClient.get("/auth/profile/"),
};

// Calendar API calls
// Calendar API calls - UPDATED with Google Calendar actions
export const calendarAPI = {
  getEvents: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get("/calendar/events/", { params }),

  createEvent: (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    priority?: "low" | "medium" | "high";
    is_all_day?: boolean;
  }) => apiClient.post("/calendar/events/", eventData),

  updateEvent: (id: number, eventData: any) =>
    apiClient.patch(`/calendar/events/${id}/`, eventData),

  deleteEvent: (id: number) => apiClient.delete(`/calendar/events/${id}/`),

  getTodaysEvents: () => apiClient.get("/calendar/events/today/"),

  getUpcomingEvents: () => apiClient.get("/calendar/events/upcoming/"),

  // NEW Google Calendar methods
  createGoogleEvent: (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    timezone?: string;
    attendees?: string[];
  }) => apiClient.post("/calendar/google/events/create/", eventData),

  updateGoogleEvent: (eventId: string, eventData: any) =>
    apiClient.put(`/calendar/google/events/${eventId}/update/`, eventData),

  deleteGoogleEvent: (eventId: string) =>
    apiClient.delete(`/calendar/google/events/${eventId}/delete/`),

  getGoogleEvent: (eventId: string) =>
    apiClient.get(`/calendar/google/events/${eventId}/`),

  findFreeTime: (params?: { duration?: number; days_ahead?: number }) =>
    apiClient.get("/calendar/google/free-time/", { params }),
};

// Tasks API calls
export const tasksAPI = {
  getTasks: (params?: {
    status?: string;
    priority?: string;
    category?: number;
  }) => apiClient.get("/tasks/tasks/", { params }),

  createTask: (taskData: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    status?: "pending" | "in_progress" | "completed";
    category?: number;
    due_date?: string;
    estimated_hours?: number;
  }) => apiClient.post("/tasks/tasks/", taskData),

  updateTask: (id: number, taskData: any) =>
    apiClient.patch(`/tasks/tasks/${id}/`, taskData),

  deleteTask: (id: number) => apiClient.delete(`/tasks/tasks/${id}/`),

  markComplete: (id: number) => apiClient.post(`/tasks/tasks/${id}/complete/`),

  getPendingTasks: () => apiClient.get("/tasks/tasks/pending/"),

  getTaskStats: () => apiClient.get("/tasks/tasks/stats/"),

  getCategories: () => apiClient.get("/tasks/categories/"),

  createCategory: (categoryData: { name: string; color: string }) =>
    apiClient.post("/tasks/categories/", categoryData),
};

// AI/Chat API calls
export const aiAPI = {
  sendMessage: (message: string, conversationId?: number) =>
    apiClient.post("/ai/chat/", {
      message,
      conversation_id: conversationId,
    }),

  getConversations: () => apiClient.get("/ai/conversations/"),

  getConversationMessages: (conversationId: number) =>
    apiClient.get(`/ai/conversations/${conversationId}/`),
};

// Email API calls - FIXED: Changed 'api' to 'apiClient'
// Email API calls - UPDATED with new email actions
export const emailAPI = {
  getEmails: (params?: { max_results?: number; query?: string }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(`/emails/emails/${queryString}`);
  },

  getUnreadEmails: () => apiClient.get("/emails/emails/unread/"),

  getRecentEmails: () => apiClient.get("/emails/emails/recent/"),

  // NEW: Mark email as read
  markAsRead: (emailId: string) =>
    apiClient.post(`/emails/emails/${emailId}/mark-read/`),

  // NEW: Mark email as unread
  markAsUnread: (emailId: string) =>
    apiClient.post(`/emails/emails/${emailId}/mark-unread/`),

  // NEW: Compose and send new email
  composeEmail: (emailData: {
    to_email: string;
    subject: string;
    body: string;
  }) => apiClient.post("/emails/emails/compose/", emailData),

  // NEW: Reply to existing email
  replyToEmail: (emailId: string, replyData: { body: string }) =>
    apiClient.post(`/emails/emails/${emailId}/reply/`, replyData),
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
  apiClient.defaults.headers.Authorization = `Token ${token}`;
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem("auth_token");
  delete apiClient.defaults.headers.Authorization;
};

// For development: Set your token automatically
// TODO: Remove this in production and implement proper login
if (process.env.NODE_ENV === "development") {
  setAuthToken("ec2142ff3feb160343cfd2d093562c28d3779e1e"); // Your token
}

export default apiClient;
