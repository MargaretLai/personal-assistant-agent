// src/components/AuthenticatedApp.tsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "./layout/MainLayout";
import NavigationTabs from "./layout/NavigationTabs";
import ChatInterface from "./chat/ChatInterface";
import CalendarView from "./calendar/CalendarView";
import TasksView from "./tasks/TasksView";
import EmailView from "./email/EmailView";
import GoogleServicesAuth from "./auth/GoogleServicesAuth";
import Footer from "./layout/Footer";

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <MainLayout>
            <ChatInterface />
          </MainLayout>
        );
      case 1: // Chat
        return (
          <Box sx={{ p: 2, height: "100vh" }}>
            <ChatInterface />
          </Box>
        );
      case 2: // Calendar
        return <CalendarView />;
      case 3: // Tasks
        return <TasksView />;
      case 4: // Emails
        return <EmailView />;
      default:
        return (
          <MainLayout>
            <ChatInterface />
          </MainLayout>
        );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <Box sx={{ p: 2, pb: 0 }}>
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>

      {/* Google Services Authorization - Only shows if needed, with proper spacing */}
      <Box sx={{ px: 2, pt: 2 }}>
        <GoogleServicesAuth
          onAuthorizationComplete={() => {
            // Refresh the page to reload Gmail/Calendar data
            window.location.reload();
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>{renderActiveView()}</Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default AuthenticatedApp;
