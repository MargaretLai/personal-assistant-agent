// src/components/tasks/TasksView.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import { Task } from "../../types";
import { mockTasks } from "../../services/mockData";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from "@mui/icons-material/Delete";

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState(0);

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
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
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

  const completionRate = Math.round(
    (tasks.filter((task) => task.completed).length / tasks.length) * 100
  );

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
            {tasks.filter((task) => task.completed).length} of {tasks.length}{" "}
            tasks completed
          </Typography>
          <Chip label={`${completionRate}%`} color="primary" size="small" />
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionRate}
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
    </Box>
  );
};

export default TasksView;
