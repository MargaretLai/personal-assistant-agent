// src/App.tsx
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "./components/layout/MainLayout";
import ChatInterface from "./components/chat/ChatInterface";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00d4ff", // Bright cyan for primary actions
      light: "#4de6ff",
      dark: "#0095cc",
    },
    secondary: {
      main: "#ff6b35", // Orange accent
      light: "#ff9563",
      dark: "#c4501a",
    },
    background: {
      default: "#0a0e1a", // Very dark blue background
      paper: "#1a1f35", // Slightly lighter for cards/papers
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
      <MainLayout>
        <ChatInterface />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
