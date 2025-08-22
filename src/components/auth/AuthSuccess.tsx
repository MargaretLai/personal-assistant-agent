// src/components/auth/AuthSuccess.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(
    async (token: string, userId: number) => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/auth/profile/",
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          console.log("User data:", userData);

          login(token, userData);
          navigate("/app");
        } else {
          const basicUser = {
            user_id: userId,
            username: `user_${userId}`,
            email: "user@example.com",
            first_name: "",
            last_name: "",
          };

          login(token, basicUser);
          navigate("/app");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to complete authentication");
        setTimeout(() => navigate("/auth/error"), 2000);
      }
    },
    [login, navigate]
  ); // Only depend on login and navigate

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("user_id");

    console.log("URL params:", { token, userId });
    console.log("Full URL:", window.location.href);

    if (token && userId) {
      fetchUserProfile(token, parseInt(userId));
    } else {
      setError("Missing authentication parameters");
      setTimeout(() => navigate("/auth/error"), 2000);
    }
  }, [searchParams, fetchUserProfile, navigate]); // ✅ Added navigate to dependencies

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
        <Typography>Redirecting...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography>Completing sign in...</Typography>
    </Box>
  );
};

export default AuthSuccess;