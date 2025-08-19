// src/components/auth/GoogleServicesAuth.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { authAPI } from "../../services/apiService";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleServicesAuthProps {
  onAuthorizationComplete?: () => void;
}

const GoogleServicesAuth: React.FC<GoogleServicesAuthProps> = ({
  onAuthorizationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasServices, setHasServices] = useState(false);
  const [scopes, setScopes] = useState<string[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkServicesStatus();
    loadGoogleScript();
  }, []);

  const loadGoogleScript = () => {
    if (window.google) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google script loaded for services");
    };
    document.head.appendChild(script);
  };

  const checkServicesStatus = async () => {
    try {
      const response = await authAPI.checkGoogleServicesStatus();
      setHasServices(response.data.has_google_services);
      setScopes(response.data.scopes || []);
    } catch (error) {
      console.error("Error checking services status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAuthorizationResponse = async (response: any) => {
    if (response.error) {
      setError(`Authorization failed: ${response.error}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authAPI.authorizeGoogleServices({
        authorization_code: response.code,
      });

      if (result.data.success) {
        setSuccess("Google services authorized successfully!");
        setHasServices(true);
        setScopes(result.data.scopes || []);
        onAuthorizationComplete?.();
      }
    } catch (error: any) {
      console.error("Authorization error:", error);
      setError(
        error.response?.data?.error || "Failed to authorize Google services"
      );
    } finally {
      setLoading(false);
    }
  };

  const requestAuthorization = () => {
    setError(null);
    setSuccess(null);

    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id:
          "877747705316-c5sc7jshsn91l5ojaeemce2clh5rr29e.apps.googleusercontent.com",
        scope: [
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/gmail.modify",
          "https://www.googleapis.com/auth/calendar",
        ].join(" "),
        callback: handleAuthorizationResponse,
      });
      client.requestCode();
    } else {
      setError("Google authorization not ready. Please refresh the page.");
    }
  };

  if (checkingStatus) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Checking Google services...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Google Services Integration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {hasServices ? (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircleIcon color="success" />
            <Typography color="success.main">
              Google services are authorized
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 1 }}>
            Authorized services:
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {scopes.includes(
              "https://www.googleapis.com/auth/gmail.readonly"
            ) && <Chip label="Gmail Read" size="small" color="primary" />}
            {scopes.includes("https://www.googleapis.com/auth/gmail.send") && (
              <Chip label="Gmail Send" size="small" color="primary" />
            )}
            {scopes.includes(
              "https://www.googleapis.com/auth/gmail.modify"
            ) && <Chip label="Gmail Modify" size="small" color="primary" />}
            {scopes.includes("https://www.googleapis.com/auth/calendar") && (
              <Chip label="Calendar" size="small" color="primary" />
            )}
          </Stack>

          <Button
            variant="outlined"
            size="small"
            onClick={requestAuthorization}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Re-authorizing..." : "Re-authorize Services"}
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To access Gmail and Calendar features, please authorize Google
            services:
          </Typography>

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={requestAuthorization}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Authorizing..." : "Authorize Google Services"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default GoogleServicesAuth;
