// src/components/tasks/TasksPreview.tsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Task } from "../../types";
import { tasksAPI } from "../../services/apiService";
import { convertApiTaskToFrontend } from "../../utils/dataConverters";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const TasksPreview: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState("");

  // Fetch pending tasks from API
  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        setLoading(true);
        const response = await tasksAPI.getPendingTasks();
        const apiTasks = response.data.tasks.slice(0, 3); // Show only first 3
        const convertedTasks = apiTasks.map(convertApiTaskToFrontend);
        setTasks(convertedTasks);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching pending tasks:", err);
        setError("Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingTasks();
  }, []);

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

  const handleTaskComplete = async (taskId: string) => {
    try {
      // Call API to mark task as complete
      await tasksAPI.markComplete(parseInt(taskId));

      // Update local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      const completedTask = tasks.find((task) => task.id === taskId);
      if (completedTask) {
        setCompletedTaskName(completedTask.title);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      // You could add error handling here
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading tasks...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Pending Tasks
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tasks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 48, color: "success.main", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {error ? "Unable to load tasks" : "All tasks completed! 🎉"}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {tasks.map((task) => (
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
