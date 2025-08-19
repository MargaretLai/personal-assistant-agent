// src/components/legal/PrivacyPolicy.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../contexts/AuthContext";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBackClick = () => {
    // If user is authenticated, go to app, otherwise go to login
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        {isAuthenticated ? "Back to App" : "Back to Login"}
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Privacy Policy
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h5" gutterBottom>
          1. Introduction
        </Typography>
        <Typography paragraph>
          Welcome to Personal AI Assistant ("we," "our," or "us"). This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our web application. Please read this privacy
          policy carefully. If you do not agree with the terms of this privacy
          policy, please do not access the application.
        </Typography>

        <Typography variant="h5" gutterBottom>
          2. Information We Collect
        </Typography>
        <Typography variant="h6" gutterBottom>
          2.1 Google Account Information
        </Typography>
        <Typography paragraph>
          When you sign in with Google, we collect:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Your Google account email address" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Your name as provided by Google" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Your profile picture (if available)" />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom>
          2.2 Google Services Data
        </Typography>
        <Typography paragraph>
          With your explicit consent, we may access:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Gmail Data"
              secondary="We read your emails to display them in the app and can send emails on your behalf when you use the compose feature."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Google Calendar Data"
              secondary="We read, create, update, and delete calendar events to help you manage your schedule."
            />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom>
          2.3 Application Data
        </Typography>
        <Typography paragraph>
          We store the following data you create in our application:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Tasks and to-do items you create" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Local calendar events you create" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Chat messages and AI conversations" />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom>
          2.4 Analytics Data
        </Typography>
        <Typography paragraph>We use Google Analytics to collect:</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Usage patterns and feature interactions" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Device and browser information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="General location data (country/region level)" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>
          3. How We Use Your Information
        </Typography>
        <Typography paragraph>We use the information we collect to:</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Provide and maintain our service" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Authenticate and authorize your access" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Display your Gmail messages and calendar events" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Create and manage tasks, events, and other content you create" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Provide AI-powered assistance and chat functionality" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Analyze usage patterns to improve our service" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>
          4. Data Storage and Security
        </Typography>
        <Typography paragraph>
          We implement appropriate security measures to protect your personal
          information:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="All data transmission is encrypted using HTTPS" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Google OAuth tokens are securely stored and regularly refreshed" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Application data is stored in secure cloud databases" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Access to your data is restricted to necessary application functions only" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>
          5. Data Sharing and Disclosure
        </Typography>
        <Typography paragraph>
          We do not sell, trade, or otherwise transfer your personal information
          to third parties except:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="To Google services (Gmail, Calendar) as necessary to provide our features" />
          </ListItem>
          <ListItem>
            <ListItemText primary="To OpenAI for AI chat functionality (chat messages only)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="When required by law or to protect our rights" />
          </ListItem>
          <ListItem>
            <ListItemText primary="With your explicit consent" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>
          6. Google API Services
        </Typography>
        <Typography paragraph>
          Our use of information received from Google APIs will adhere to the
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "none" }}
          >
            {" "}
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </Typography>

        <Typography variant="h5" gutterBottom>
          7. Your Rights and Choices
        </Typography>
        <Typography paragraph>
          You have the following rights regarding your data:
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Access and Portability"
              secondary="You can view all your data within the application interface"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Deletion"
              secondary="You can delete your tasks, events, and other content at any time"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Revoke Access"
              secondary="You can revoke Google services access through your Google Account settings"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Account Deletion"
              secondary="Contact us to request complete account and data deletion"
            />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom>
          8. Data Retention
        </Typography>
        <Typography paragraph>
          We retain your data for as long as your account is active or as needed
          to provide services. We will delete your data when you request account
          deletion or after a period of prolonged inactivity.
        </Typography>

        <Typography variant="h5" gutterBottom>
          9. Children's Privacy
        </Typography>
        <Typography paragraph>
          Our service is not intended for children under 13 years of age. We do
          not knowingly collect personal information from children under 13.
        </Typography>

        <Typography variant="h5" gutterBottom>
          10. Changes to This Privacy Policy
        </Typography>
        <Typography paragraph>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new privacy policy on this page and
          updating the "Last updated" date.
        </Typography>

        <Typography variant="h5" gutterBottom>
          11. Contact Information
        </Typography>
        <Typography paragraph>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </Typography>
        <Typography paragraph>Email: margaretlui01@gmail.com</Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          This privacy policy was last updated on{" "}
          {new Date().toLocaleDateString()}
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
