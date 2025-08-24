// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./components/HomePage";
import AuthenticatedApp from "./components/AuthenticatedApp";
import LoginPage from "./components/auth/LoginPage";
import AuthSuccess from "./components/auth/AuthSuccess";
import AuthError from "./components/auth/AuthError";

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
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}

            {/* Auth Routes */}
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/error" element={<AuthError />} />

            {/* Protected Routes */}
            <Route path="/app/*" element={<AuthenticatedApp />} />
            <Route path="/dashboard/*" element={<AuthenticatedApp />} />

            {/* Redirect old paths to new structure */}
            <Route path="/chat" element={<Navigate to="/app" replace />} />
            <Route path="/calendar" element={<Navigate to="/app" replace />} />
            <Route path="/tasks" element={<Navigate to="/app" replace />} />
            <Route path="/emails" element={<Navigate to="/app" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
