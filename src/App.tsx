// src/App.tsx
import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import MainLayout from "./components/layout/MainLayout";
import NavigationTabs from "./components/layout/NavigationTabs";
import ChatInterface from "./components/chat/ChatInterface";
import CalendarView from "./components/calendar/CalendarView";
import TasksView from "./components/tasks/TasksView";
import EmailView from "./components/email/EmailView";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00d4ff",
      light: "#4de6ff",
      dark: "#0095cc",
    },
    secondary: {
      main: "#ff6b35",
      light: "#ff9563",
      dark: "#c4501a",
    },
    background: {
      default: "#0a0e1a",
      paper: "#1a1f35",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b8c5d1",
    },
    success: {
      main: "#00ff88",
    },
    warning: {
      main: "#ffb347",
    },
    error: {
      main: "#ff4757",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
          border: "1px solid rgba(0, 212, 255, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(0, 212, 255, 0.3)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0, 212, 255, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00d4ff",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          marginBottom: "4px",
          "&:hover": {
            backgroundColor: "rgba(0, 212, 255, 0.05)",
          },
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh" }}>
        {/* Navigation */}
        <Box sx={{ p: 2, pb: 0 }}>
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </Box>

        {/* Main Content */}
        {renderActiveView()}
      </Box>
    </ThemeProvider>
  );
}

export default App;
