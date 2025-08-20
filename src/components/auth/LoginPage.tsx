// src/components/auth/LoginPage.tsx
import React, { useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Stack,
  Alert,
  Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { authAPI } from "../../services/apiService";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth

declare global {
  interface Window {
    google: any;
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from context
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "877747705316-c5sc7jshsn91l5ojaeemce2clh5rr29e.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError(null);

    try {
      // Send the ID token to your backend
      const result = await authAPI.googleOAuth({
        id_token: response.credential,
      });

      if (result.data.success) {
        console.log("Login successful:", result.data.user);

        // Use the context login function instead of manual localStorage
        login(result.data.token, result.data.user);

        // Redirect to app
        navigate("/app");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      setError(
        error.response?.data?.error ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    if (window.google) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: show one-tap UI
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            {
              theme: "outline",
              size: "large",
              width: "100%",
            }
          );
        }
      });
    } else {
      setError(
        "Google Sign-In not loaded. Please refresh the page and try again."
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Personal AI Assistant
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your calendar, tasks, and AI assistant
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                textTransform: "none",
              }}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Fallback button container for Google's rendered button */}
            <div id="google-signin-button" style={{ minHeight: "44px" }}></div>
          </Stack>
        </Paper>

        {/* Footer with Privacy Policy link */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Personal AI Assistant
          </Typography>
          <Link
            component={RouterLink}
            to="/privacy-policy"
            variant="body2"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
              mt: 1,
              display: "block",
            }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
