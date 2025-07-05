// src/components/email/EmailPreview.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import { Email } from "../../types";
import { mockEmails } from "../../services/mockData";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

const EmailPreview: React.FC = () => {
  const [emails, setEmails] = useState(mockEmails);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const unreadEmails = emails.filter((email) => !email.isRead).slice(0, 3);

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

  const getFullEmailContent = (email: Email) => {
    // Mock full email content
    const fullContents: { [key: string]: string } = {
      "1": `Hi there,

Can you please send me the latest project status by EOD? We need to prepare for the client meeting tomorrow and I want to make sure we're covering all the key points.

Also, please include:
- Current progress percentage
- Any blockers or issues
- Updated timeline
- Resource requirements

Thanks!
Sarah`,
      "3": `Dear Valued Customer,

Your monthly subscription payment of $29.99 is due on July 10th. Please ensure your payment method is up to date to avoid any service interruptions.

You can update your payment information by logging into your account at webservices.com/billing.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Billing Team`,
    };

    return (
      fullContents[email.id] ||
      email.snippet + "\n\n[Full email content would be loaded here...]"
    );
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
        <Box sx={{ textAlign: "center", py: 4 }}>
          <MarkEmailReadIcon
            sx={{ fontSize: 48, color: "success.main", mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            No new emails
          </Typography>
        </Box>
      ) : (
        <List dense>
          {unreadEmails.map((email) => (
            <Box key={email.id}>
              <ListItem
                sx={{
                  px: 0,
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 212, 255, 0.05)",
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
                    {getFullEmailContent(email)}
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
