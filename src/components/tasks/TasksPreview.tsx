// src/components/tasks/TasksPreview.tsx
import React, { useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  IconButton,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import { Task } from "../../types";
import { getPendingTasks, mockTasks } from "../../services/mockData";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const TasksPreview: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState("");

  const pendingTasks = tasks.filter((task) => !task.completed).slice(0, 3);

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

  const handleTaskComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );

    const completedTask = tasks.find((task) => task.id === taskId);
    if (completedTask) {
      setCompletedTaskName(completedTask.title);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Pending Tasks
        </Typography>

        {pendingTasks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 48, color: "success.main", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              All tasks completed! 🎉
            </Typography>
          </Box>
        ) : (
          <List dense>
            {pendingTasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  px: 0,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 212, 255, 0.05)",
                  },
                }}
              >
                <Checkbox
                  icon={<RadioButtonUncheckedIcon />}
                  checkedIcon={<CheckCircleIcon />}
                  checked={task.completed}
                  onChange={() => handleTaskComplete(task.id)}
                  sx={{
                    color: getPriorityColor(task.priority) + ".main",
                    "&.Mui-checked": {
                      color: "success.main",
                    },
                  }}
                />
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 500,
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                    >
                      {task.title}
                    </Typography>
                  }
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

        {tasks.filter((task) => !task.completed).length > 3 && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ mt: 1, display: "block" }}
          >
            +{tasks.filter((task) => !task.completed).length - 3} more tasks
          </Typography>
        )}
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          ✅ Completed: "{completedTaskName}"
        </Alert>
      </Snackbar>
    </>
  );
};

export default TasksPreview;
