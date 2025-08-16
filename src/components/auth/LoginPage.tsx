// src/components/auth/LoginPage.tsx
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    // Redirect to Django OAuth endpoint
    window.location.href = "http://localhost:8000/api/v1/auth/google/";
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
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

          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                textTransform: "none",
              }}
            >
              Sign in with Google
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
