// src/components/HomePage.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import ChatIcon from "@mui/icons-material/Chat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TaskIcon from "@mui/icons-material/Task";
import EmailIcon from "@mui/icons-material/Email";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import Footer from "./layout/Footer";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const features = [
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "AI Assistant",
      description:
        "Chat with your personal AI to get help with daily tasks, planning, and productivity.",
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Calendar Management",
      description:
        "Seamlessly integrate with Google Calendar to manage your schedule and events.",
    },
    {
      icon: <TaskIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Task Organization",
      description:
        "Create, manage, and track your tasks and to-do lists with intelligent suggestions.",
    },
    {
      icon: <EmailIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Email Integration",
      description:
        "Access and manage your Gmail messages directly within the application.",
    },
  ];

  const benefits = [
    {
      icon: <SecurityIcon sx={{ fontSize: 30, color: "success.main" }} />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We respect your privacy.",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 30, color: "warning.main" }} />,
      title: "Lightning Fast",
      description: "Built for speed and efficiency. Get things done quickly.",
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 30, color: "secondary.main" }} />,
      title: "AI-Powered",
      description:
        "Intelligent assistance that learns and adapts to help you better.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Google Site Verification - Hidden meta tag equivalent */}
      <Box
        component="meta"
        name="google-site-verification"
        content="google9cec98a809f186e6"
        sx={{ display: "none" }}
      />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #00d4ff 30%, #ff6b35 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Personal AI Assistant
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
          >
            Streamline your productivity with AI-powered assistance for
            calendar, tasks, email, and more.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => navigate("/login")}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                textTransform: "none",
                background: "linear-gradient(45deg, #00d4ff 30%, #0095cc 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #4de6ff 30%, #00d4ff 90%)",
                },
              }}
            >
              Get Started
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/privacy-policy")}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                textTransform: "none",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.light",
                  backgroundColor: "rgba(0, 212, 255, 0.05)",
                },
              }}
            >
              Privacy Policy
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Chip label="Free to Use" variant="outlined" color="success" />
            <Chip
              label="Google Integration"
              variant="outlined"
              color="primary"
            />
            <Chip label="AI-Powered" variant="outlined" color="secondary" />
          </Stack>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Everything You Need in One Place
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} item xs={12} md={6}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Box sx={{ flexShrink: 0 }}>{feature.icon}</Box>
                      <Box>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            mb: 8,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Why Choose Our Assistant?
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {benefits.map((benefit, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>{benefit.icon}</Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box sx={{ textAlign: "center" }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              background:
                "linear-gradient(45deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.3)",
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Sign in with your Google account and start boosting your
              productivity today.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => navigate("/login")}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1.2rem",
                textTransform: "none",
                background: "linear-gradient(45deg, #00d4ff 30%, #0095cc 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #4de6ff 30%, #00d4ff 90%)",
                },
              }}
            >
              Sign In with Google
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
