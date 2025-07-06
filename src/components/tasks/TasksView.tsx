// src/components/tasks/TasksView.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Button,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Task } from "../../types";
import { tasksAPI } from "../../services/apiService";
import {
  convertApiTaskToFrontend,
  convertFrontendTaskToApi,
} from "../../utils/dataConverters";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from "@mui/icons-material/Delete";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completion_rate: 0,
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    dueDate: "",
  });

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const [tasksResponse, statsResponse] = await Promise.all([
          tasksAPI.getTasks(),
          tasksAPI.getTaskStats(),
        ]);

        const apiTasks = tasksResponse.data.results;
        const convertedTasks = apiTasks.map(convertApiTaskToFrontend);
        setTasks(convertedTasks);
        setTaskStats(statsResponse.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
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
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );

      // Update stats
      setTaskStats((prev) => ({
        ...prev,
        completed: prev.completed + 1,
        pending: prev.pending - 1,
        completion_rate: Math.round(((prev.completed + 1) / prev.total) * 100),
      }));

      const completedTask = tasks.find((task) => task.id === taskId);
      if (completedTask) {
        setSnackbarMessage(`Task "${completedTask.title}" completed!`);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      setSnackbarMessage("Failed to complete task. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 0:
        return tasks; // All
      case 1:
        return tasks.filter((task) => !task.completed); // Pending
      case 2:
        return tasks.filter((task) => task.completed); // Completed
      case 3:
        return tasks.filter(
          (task) => !task.completed && task.priority === "high"
        ); // High Priority
      default:
        return tasks;
    }
  };

  const handleNewTask = () => {
    setShowNewTaskDialog(true);
  };

  const handleSaveNewTask = async () => {
    if (newTask.title.trim()) {
      try {
        const taskData = convertFrontendTaskToApi({
          title: newTask.title,
          description: newTask.description || undefined,
          priority: newTask.priority,
          completed: false,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        });

        const response = await tasksAPI.createTask(taskData);
        const createdTask = convertApiTaskToFrontend(response.data);

        setTasks((prev) => [...prev, createdTask]);
        setTaskStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
          completion_rate: Math.round(
            (prev.completed / (prev.total + 1)) * 100
          ),
        }));

        setShowNewTaskDialog(false);
        setSnackbarMessage(`Task "${newTask.title}" created successfully!`);
        setSnackbarOpen(true);

        // Reset form
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
        });
      } catch (error) {
        console.error("Error creating task:", error);
        setSnackbarMessage("Failed to create task. Please try again.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCancelNewTask = () => {
    setShowNewTaskDialog(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            ✅ Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your todos and track progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewTask}
          sx={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4de6ff 0%, #00d4ff 100%)",
            },
          }}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress Overview */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          📊 Progress Overview
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="body2">
            {taskStats.completed} of {taskStats.total} tasks completed
          </Typography>
          <Chip
            label={`${taskStats.completion_rate}%`}
            color="primary"
            size="small"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={taskStats.completion_rate}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #00d4ff 0%, #00ff88 100%)",
            },
          }}
        />
      </Paper>

      {/* Filter Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg, #00d4ff 0%, #ff6b35 100%)",
            },
          }}
        >
          <Tab label={`All (${tasks.length})`} />
          <Tab
            label={`Pending (${
              tasks.filter((task) => !task.completed).length
            })`}
          />
          <Tab
            label={`Completed (${
              tasks.filter((task) => task.completed).length
            })`}
          />
          <Tab
            label={`High Priority (${
              tasks.filter(
                (task) => !task.completed && task.priority === "high"
              ).length
            })`}
          />
        </Tabs>
      </Paper>

      {/* Tasks List */}
      <Paper
        elevation={2}
        sx={{ background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)" }}
      >
        <List>
          {getFilteredTasks().map((task, index) => (
            <ListItem
              key={task.id}
              sx={{
                borderBottom:
                  index < getFilteredTasks().length - 1
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        opacity: task.completed ? 0.6 : 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {task.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {task.description}
                      </Typography>
                    )}
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDueDate(task.dueDate)}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <IconButton
                color="error"
                sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* New Task Dialog */}
      <Dialog
        open={showNewTaskDialog}
        onClose={handleCancelNewTask}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TaskAltIcon color="primary" />
            <Typography variant="h6">Create New Task</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    priority: e.target.value as "high" | "medium" | "low",
                  }))
                }
              >
                <MenuItem value="low">🟢 Low</MenuItem>
                <MenuItem value="medium">🟡 Medium</MenuItem>
                <MenuItem value="high">🔴 High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelNewTask}>Cancel</Button>
          <Button
            onClick={handleSaveNewTask}
            variant="contained"
            disabled={!newTask.title.trim()}
            sx={{
              background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TasksView;
