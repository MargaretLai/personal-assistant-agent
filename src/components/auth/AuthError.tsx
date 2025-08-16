// src/components/auth/AuthError.tsx
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthError: React.FC = () => {
  const navigate = useNavigate();

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
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Authentication failed
          </Alert>

          <Typography variant="h5" gutterBottom>
            Sign In Failed
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            There was an error signing you in. Please try again.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            size="large"
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthError;
