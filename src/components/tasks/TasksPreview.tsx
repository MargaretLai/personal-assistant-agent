// src/components/tasks/TasksPreview.tsx
import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { getPendingTasks } from "../../services/mockData";

const TasksPreview: React.FC = () => {
  const pendingTasks = getPendingTasks().slice(0, 3); // Show only first 3

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Due today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Due tomorrow";
    } else {
      return `Due ${date.toLocaleDateString()}`;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Pending Tasks
      </Typography>

      {pendingTasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          All tasks completed! 🎉
        </Typography>
      ) : (
        <List dense>
          {pendingTasks.map((task) => (
            <ListItem key={task.id} sx={{ px: 0 }}>
              <ListItemText
                primary={task.title}
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      sx={{ fontSize: "0.7rem" }}
                    />
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDueDate(task.dueDate)}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {getPendingTasks().length > 3 && (
        <Typography
          variant="caption"
          color="primary"
          sx={{ mt: 1, display: "block" }}
        >
          +{getPendingTasks().length - 3} more tasks
        </Typography>
      )}
    </Paper>
  );
};

export default TasksPreview;
