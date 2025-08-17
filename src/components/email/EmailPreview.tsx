// src/components/email/EmailPreview.tsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  Box,
  Collapse,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { emailAPI } from "../../services/apiService";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

interface Email {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  body?: string;
  timestamp: string;
  isRead: boolean;
  is_gmail?: boolean;
}

const EmailPreview: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent emails from API
  useEffect(() => {
    const fetchRecentEmails = async () => {
      try {
        setLoading(true);
        const response = await emailAPI.getRecentEmails();
        setEmails(response.data.emails || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching recent emails:", err);
        setError("Failed to load emails");
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEmails();
  }, []);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Recently";
    }
  };

  const handleEmailClick = (emailId: string) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId);
  };

  const handleMarkAsRead = (emailId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent email expansion
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  };

  const getEmailContent = (email: Email) => {
    return (
      email.body || email.snippet + "\n\n[Full email content from Gmail...]"
    );
  };

  const unreadEmails = emails.filter((email) => !email.isRead);

  if (loading) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          height: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading emails...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, mr: 1 }}>
          Recent Emails
        </Typography>
        {unreadEmails.length > 0 && (
          <Badge badgeContent={unreadEmails.length} color="primary" />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {emails.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <MarkEmailReadIcon
            sx={{ fontSize: 48, color: "success.main", mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {error ? "Unable to load emails" : "No recent emails"}
          </Typography>
        </Box>
      ) : (
        <List dense>
          {emails.slice(0, 3).map((email) => (
            <Box key={email.id}>
              <ListItem
                sx={{
                  px: 0,
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                  },
                }}
                onClick={() => handleEmailClick(email.id)}
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: email.isRead ? "normal" : "bold",
                          flex: 1,
                        }}
                      >
                        {email.subject}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleMarkAsRead(email.id, e)}
                          sx={{ opacity: 0.7 }}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ opacity: 0.7 }}>
                          {expandedEmail === email.id ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="caption"
                        display="block"
                        color="primary"
                      >
                        {email.sender}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        {email.snippet.substring(0, 60)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(email.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>

              <Collapse
                in={expandedEmail === email.id}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-line",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      p: 2,
                      borderRadius: 1,
                      fontSize: "0.85rem",
                    }}
                  >
                    {getEmailContent(email)}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default EmailPreview;
