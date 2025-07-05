// src/components/email/EmailPreview.tsx
import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  Box,
} from "@mui/material";
import { getUnreadEmails } from "../../services/mockData";

const EmailPreview: React.FC = () => {
  const unreadEmails = getUnreadEmails().slice(0, 3); // Show only first 3

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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

      {unreadEmails.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No new emails
        </Typography>
      ) : (
        <List dense>
          {unreadEmails.map((email) => (
            <ListItem key={email.id} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: email.isRead ? "normal" : "bold" }}
                  >
                    {email.subject}
                  </Typography>
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
          ))}
        </List>
      )}
    </Paper>
  );
};

export default EmailPreview;
