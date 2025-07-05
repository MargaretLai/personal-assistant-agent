// src/components/layout/MainLayout.tsx
import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import CalendarPreview from "../calendar/CalendarPreview";
import TasksPreview from "../tasks/TasksPreview";
import EmailPreview from "../email/EmailPreview";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        height: "100vh",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left Panel - Chat Interface */}
      <Box sx={{ flex: 2, minHeight: "500px" }}>
        <Paper
          elevation={3}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chat with Your Assistant
          </Typography>
          {children}
        </Paper>
      </Box>

      {/* Right Panel - Quick Info */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: "300px",
        }}
      >
        <CalendarPreview />
        <TasksPreview />
        <EmailPreview />
      </Box>
    </Box>
  );
};

export default MainLayout;
