// src/services/chatService.ts
import {
  mockCalendarEvents,
  mockEmails,
  mockTasks,
  mockNotes,
  getTodaysEvents,
  getPendingTasks,
  getUnreadEmails,
} from "./mockData";
import { ChatMessage } from "../types";

interface CommandResponse {
  message: string;
  action?:
    | "show_calendar"
    | "show_tasks"
    | "show_emails"
    | "add_task"
    | "mark_complete";
  data?: any;
}

export class ChatService {
  // Parse user input and determine intent
  static parseCommand(userInput: string): CommandResponse {
    const input = userInput.toLowerCase().trim();

    // Calendar-related commands
    if (
      this.matchesKeywords(input, [
        "calendar",
        "schedule",
        "meeting",
        "appointment",
        "today",
      ])
    ) {
      return this.handleCalendarCommand(input);
    }

    // Task-related commands
    if (
      this.matchesKeywords(input, [
        "task",
        "todo",
        "complete",
        "finish",
        "pending",
      ])
    ) {
      return this.handleTaskCommand(input);
    }

    // Email-related commands
    if (
      this.matchesKeywords(input, [
        "email",
        "mail",
        "message",
        "unread",
        "inbox",
      ])
    ) {
      return this.handleEmailCommand(input);
    }

    // Add task command
    if (
      this.matchesKeywords(input, ["add", "create", "new"]) &&
      this.matchesKeywords(input, ["task", "todo", "reminder"])
    ) {
      return this.handleAddTaskCommand(input);
    }

    // General help
    if (this.matchesKeywords(input, ["help", "what can you do", "commands"])) {
      return this.handleHelpCommand();
    }

    // Default response
    return {
      message: `I understand you said "${userInput}". Here are some things I can help with:
      
📅 **Calendar**: "Show my calendar" or "What's my schedule today?"
✅ **Tasks**: "Show my tasks" or "Mark task as complete"
📧 **Emails**: "Show my emails" or "Any new messages?"
➕ **Add**: "Add task: finish presentation"

Try asking me about your schedule, tasks, or emails!`,
    };
  }

  private static matchesKeywords(input: string, keywords: string[]): boolean {
    return keywords.some((keyword) => input.includes(keyword));
  }

  private static handleCalendarCommand(input: string): CommandResponse {
    const todaysEvents = getTodaysEvents();

    if (todaysEvents.length === 0) {
      return {
        message:
          "📅 You have no events scheduled for today. Your schedule is clear!",
        action: "show_calendar",
      };
    }

    const eventsList = todaysEvents
      .map((event) => {
        const startTime = event.start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const endTime = event.end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return `• **${event.title}** (${startTime} - ${endTime})${
          event.location ? ` at ${event.location}` : ""
        }`;
      })
      .join("\n");

    return {
      message: `📅 **Today's Schedule:**

${eventsList}

Looking good! ${
        todaysEvents.length === 1
          ? "Just one meeting"
          : `${todaysEvents.length} meetings`
      } scheduled for today.`,
      action: "show_calendar",
      data: todaysEvents,
    };
  }

  private static handleTaskCommand(input: string): CommandResponse {
    const pendingTasks = getPendingTasks();

    // Check if user wants to mark something complete
    if (this.matchesKeywords(input, ["complete", "done", "finish", "mark"])) {
      return {
        message:
          "✅ I'd love to help you mark tasks as complete! This feature is coming soon. For now, you can see all your pending tasks below.",
        action: "show_tasks",
      };
    }

    if (pendingTasks.length === 0) {
      return {
        message:
          "🎉 Congratulations! You have no pending tasks. All caught up!",
        action: "show_tasks",
      };
    }

    const tasksList = pendingTasks
      .slice(0, 5)
      .map((task) => {
        const priority =
          task.priority === "high"
            ? "🔴"
            : task.priority === "medium"
            ? "🟡"
            : "🟢";
        const dueDate = task.dueDate
          ? ` (Due: ${task.dueDate.toLocaleDateString()})`
          : "";
        return `${priority} **${task.title}**${dueDate}`;
      })
      .join("\n");

    return {
      message: `✅ **Your Pending Tasks:**

${tasksList}

${
  pendingTasks.length > 5
    ? `\n...and ${pendingTasks.length - 5} more tasks`
    : ""
}

You've got this! 💪`,
      action: "show_tasks",
      data: pendingTasks,
    };
  }

  private static handleEmailCommand(input: string): CommandResponse {
    const unreadEmails = getUnreadEmails();

    if (unreadEmails.length === 0) {
      return {
        message: "📧 Your inbox is clean! No unread emails at the moment. ✨",
        action: "show_emails",
      };
    }

    const emailsList = unreadEmails
      .slice(0, 3)
      .map((email) => {
        return `📧 **${email.subject}**\n   From: ${
          email.sender
        }\n   "${email.snippet.substring(0, 80)}..."`;
      })
      .join("\n\n");

    return {
      message: `📧 **You have ${unreadEmails.length} unread email${
        unreadEmails.length !== 1 ? "s" : ""
      }:**

${emailsList}

${
  unreadEmails.length > 3
    ? `\n...and ${unreadEmails.length - 3} more unread emails`
    : ""
}`,
      action: "show_emails",
      data: unreadEmails,
    };
  }

  private static handleAddTaskCommand(input: string): CommandResponse {
    // Extract task name from input (basic implementation)
    const taskMatch =
      input.match(/add task:?\s*(.+)/i) || input.match(/create task:?\s*(.+)/i);
    const taskName = taskMatch ? taskMatch[1].trim() : "New task from chat";

    return {
      message: `✅ Great! I would add "${taskName}" to your task list. 

📝 **Task Creation** feature is coming soon! For now, I can show you your existing tasks and help you stay organized.

What else can I help you with?`,
      action: "add_task",
      data: { taskName },
    };
  }

  private static handleHelpCommand(): CommandResponse {
    return {
      message: `🤖 **I'm your AI Personal Assistant!** Here's what I can help you with:

📅 **Calendar Management**
   • "Show my calendar" or "What's my schedule?"
   • "Any meetings today?"

✅ **Task Management**
   • "Show my tasks" or "What do I need to do?"
   • "Mark task as complete"
   • "Add task: [task name]"

📧 **Email Assistant**
   • "Show my emails" or "Any new messages?"
   • "Check my inbox"

💡 **Tips:**
   • Just ask naturally! I understand conversational language
   • I can help you stay organized and productive
   • More features coming soon!

Try asking me about your schedule, tasks, or emails! 🚀`,
    };
  }
}
