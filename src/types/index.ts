// src/types/index.ts
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
  description?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
