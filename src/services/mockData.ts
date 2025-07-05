// src/services/mockData.ts
import { CalendarEvent, Email, Task, Note } from "../types";

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    start: new Date(2025, 6, 5, 9, 0), // Today 9:00 AM
    end: new Date(2025, 6, 5, 9, 30), // Today 9:30 AM
    description: "Daily team standup meeting",
    location: "Conference Room A",
  },
  {
    id: "2",
    title: "Client Presentation",
    start: new Date(2025, 6, 5, 14, 0), // Today 2:00 PM
    end: new Date(2025, 6, 5, 15, 0), // Today 3:00 PM
    description: "Present Q3 progress to client",
    location: "Zoom Meeting",
  },
  {
    id: "3",
    title: "Doctor Appointment",
    start: new Date(2025, 6, 6, 11, 0), // Tomorrow 11:00 AM
    end: new Date(2025, 6, 6, 12, 0), // Tomorrow 12:00 PM
    description: "Annual checkup",
    location: "Downtown Medical Center",
  },
];

// Mock Emails
export const mockEmails: Email[] = [
  {
    id: "1",
    subject: "Q3 Project Update Required",
    sender: "sarah.manager@company.com",
    snippet:
      "Hi, can you please send me the latest project status by EOD? We need to prepare for the client meeting...",
    timestamp: new Date(2025, 6, 5, 8, 30),
    isRead: false,
  },
  {
    id: "2",
    subject: "Welcome to AI Conference 2025!",
    sender: "events@aiconference.com",
    snippet:
      "Thank you for registering! Here are the details for the upcoming AI Conference. Your ticket is attached...",
    timestamp: new Date(2025, 6, 4, 16, 45),
    isRead: true,
  },
  {
    id: "3",
    subject: "Invoice #1234 - Payment Due",
    sender: "billing@webservices.com",
    snippet:
      "Your monthly subscription payment of $29.99 is due on July 10th. Please ensure your payment method...",
    timestamp: new Date(2025, 6, 4, 10, 15),
    isRead: false,
  },
  {
    id: "4",
    subject: "Weekend Plans?",
    sender: "alex.friend@gmail.com",
    snippet:
      "Hey! Want to grab dinner this Saturday? I found this new restaurant downtown that looks amazing...",
    timestamp: new Date(2025, 6, 3, 19, 20),
    isRead: true,
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Finish project proposal",
    completed: false,
    priority: "high",
    dueDate: new Date(2025, 6, 6), // Tomorrow
    description: "Complete the AI integration proposal for the client",
  },
  {
    id: "2",
    title: "Review team code submissions",
    completed: false,
    priority: "medium",
    dueDate: new Date(2025, 6, 7), // Day after tomorrow
    description: "Code review for the new authentication system",
  },
  {
    id: "3",
    title: "Buy groceries",
    completed: false,
    priority: "low",
    dueDate: new Date(2025, 6, 5), // Today
    description: "Milk, eggs, bread, vegetables",
  },
  {
    id: "4",
    title: "Call dentist for appointment",
    completed: true,
    priority: "medium",
    dueDate: new Date(2025, 6, 4), // Yesterday
    description: "Schedule cleaning appointment",
  },
  {
    id: "5",
    title: "Update portfolio website",
    completed: false,
    priority: "low",
    dueDate: new Date(2025, 6, 10),
    description: "Add new projects and update resume section",
  },
];

// Mock Notes
export const mockNotes: Note[] = [
  {
    id: "1",
    title: "Meeting Notes - Client Call",
    content:
      "Discussed project timeline, budget constraints, and feature priorities. Client wants to focus on mobile-first design.",
    tags: ["work", "client", "meeting"],
    createdAt: new Date(2025, 6, 4, 14, 30),
    updatedAt: new Date(2025, 6, 4, 14, 30),
  },
  {
    id: "2",
    title: "Weekend Project Ideas",
    content:
      "Build a weather app with React, Learn Docker basics, Try new recipe for pasta",
    tags: ["personal", "projects", "learning"],
    createdAt: new Date(2025, 6, 3, 20, 15),
    updatedAt: new Date(2025, 6, 3, 20, 15),
  },
  {
    id: "3",
    title: "Book Recommendations",
    content:
      "Clean Code by Robert Martin, The Pragmatic Programmer, System Design Interview",
    tags: ["books", "learning", "programming"],
    createdAt: new Date(2025, 6, 2, 16, 45),
    updatedAt: new Date(2025, 6, 2, 16, 45),
  },
];

// Helper functions
export const getTodaysEvents = (): CalendarEvent[] => {
  const today = new Date();
  return mockCalendarEvents.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === today.toDateString();
  });
};

export const getUnreadEmails = (): Email[] => {
  return mockEmails.filter((email) => !email.isRead);
};

export const getPendingTasks = (): Task[] => {
  return mockTasks.filter((task) => !task.completed);
};

export const getHighPriorityTasks = (): Task[] => {
  return mockTasks.filter(
    (task) => !task.completed && task.priority === "high"
  );
};
