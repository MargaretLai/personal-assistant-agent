// src/components/email/EmailView.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Tabs,
  Tab,
  Badge,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { Email } from "../../types";
import { mockEmails } from "../../services/mockData";
import AddIcon from "@mui/icons-material/Add";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ReplyIcon from "@mui/icons-material/Reply";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmailIcon from "@mui/icons-material/Email";
import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";

const EmailView: React.FC = () => {
  const [emails, setEmails] = useState(mockEmails);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFilteredEmails = () => {
    switch (activeTab) {
      case 0:
        return emails; // All
      case 1:
        return emails.filter((email) => !email.isRead); // Unread
      case 2:
        return emails.filter((email) => email.isRead); // Read
      default:
        return emails;
    }
  };

  const handleMarkAsRead = (emailId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleMarkAsRead(email.id);
    }
  };

  const getFullEmailContent = (email: Email) => {
    const fullContents: { [key: string]: string } = {
      "1": `Hi there,

Can you please send me the latest project status by EOD? We need to prepare for the client meeting tomorrow and I want to make sure we're covering all the key points.

Also, please include:
- Current progress percentage
- Any blockers or issues
- Updated timeline
- Resource requirements

Looking forward to your update.

Thanks!
Sarah

--
Sarah Johnson
Project Manager
sarah.manager@company.com
(555) 123-4567`,

      "2": `Dear AI Conference Attendee,

Welcome to AI Conference 2025! We're excited to have you join us for what promises to be an incredible event.

**Conference Details:**
📅 Date: July 15-17, 2025
📍 Location: San Francisco Convention Center
🎫 Your ticket: Premium Pass #AC2025-1234

**What to Expect:**
- 50+ expert speakers from leading AI companies
- Hands-on workshops and labs
- Networking opportunities with 2,000+ attendees
- Exclusive access to new product announcements

**Getting Ready:**
- Download the conference app: ai-conference.com/app
- Review the schedule: ai-conference.com/schedule
- Join our Slack community: #aiconf2025

We can't wait to see you there!

Best regards,
The AI Conference Team`,

      "3": `Dear Valued Customer,

Your monthly subscription payment of $29.99 is due on July 10th. Please ensure your payment method is up to date to avoid any service interruptions.

**Account Details:**
- Account: Premium Plan
- Next billing date: July 10, 2025
- Amount due: $29.99

**Payment Method:**
Your card ending in ****4567 will be charged automatically. If you need to update your payment information, please visit: webservices.com/billing

**Questions?**
If you have any questions about your bill or need assistance, our support team is here to help 24/7 at support@webservices.com.

Thank you for being a valued customer!

Best regards,
Billing Team
Web Services Inc.`,

      "4": `Hey!

Hope you're doing well! I was thinking we should finally try that new restaurant downtown that everyone's been talking about. 

How about this Saturday around 7 PM? I heard they have amazing pasta and the atmosphere is supposed to be really nice. Perfect for catching up!

Let me know if that works for you, or if you prefer a different day. I'm pretty flexible this weekend.

Also, did you see the latest episode of that show we were watching? No spoilers, but WOW! 

Talk soon!
Alex

P.S. - Bring your appetite! 😄`,
    };

    return (
      fullContents[email.id] ||
      email.snippet + "\n\n[Full email content would be loaded here...]"
    );
  };

  const getSenderInitials = (sender: string) => {
    const parts = sender.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return sender.substring(0, 2).toUpperCase();
  };

  const getSenderColor = (sender: string) => {
    const colors = ["#00d4ff", "#ff6b35", "#00ff88", "#ffb347", "#ff4757"];
    const hash = sender.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const unreadCount = emails.filter((email) => !email.isRead).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            📧 Emails
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your inbox and stay connected
          </Typography>
        </Box>
        {/* <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4de6ff 0%, #00d4ff 100%)",
            },
          }}
        >
          Compose
        </Button> */}
      </Box>

      {/* Stats Overview */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
          <InboxIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {emails.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Emails
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
          <Badge badgeContent={unreadCount} color="error">
            <EmailIcon sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
          </Badge>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {unreadCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unread
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
          <MarkEmailReadIcon
            sx={{ fontSize: 40, color: "success.main", mb: 1 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {emails.length - unreadCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Read
          </Typography>
        </Paper>
      </Box>

      {/* Filter Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg, #00d4ff 0%, #ff6b35 100%)",
            },
          }}
        >
          <Tab label={`All (${emails.length})`} />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Unread
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    size="small"
                    color="error"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}
              </Box>
            }
          />
          <Tab label={`Read (${emails.length - unreadCount})`} />
        </Tabs>
      </Paper>

      {/* Email List */}
      <Paper
        elevation={2}
        sx={{ background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)" }}
      >
        <List>
          {getFilteredEmails().map((email, index) => (
            <ListItem
              key={email.id}
              sx={{
                cursor: "pointer",
                borderBottom:
                  index < getFilteredEmails().length - 1
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
                "&:hover": {
                  backgroundColor: "rgba(0, 212, 255, 0.05)",
                },
                opacity: email.isRead ? 0.8 : 1,
              }}
              onClick={() => handleEmailClick(email)}
            >
              <Avatar
                sx={{
                  bgcolor: getSenderColor(email.sender),
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                {getSenderInitials(email.sender)}
              </Avatar>

              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: email.isRead ? 400 : 600,
                        fontSize: "1.1rem",
                      }}
                    >
                      {email.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(email.timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ mb: 0.5 }}
                    >
                      {email.sender}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {email.snippet}
                    </Typography>
                  </Box>
                }
              />

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 2 }}
              >
                {!email.isRead && (
                  <Chip
                    label="NEW"
                    color="primary"
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleMarkAsRead(email.id, e)}
                  sx={{ opacity: 0.7 }}
                >
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Email Detail Dialog */}
      <Dialog
        open={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
          },
        }}
      >
        {selectedEmail && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: getSenderColor(selectedEmail.sender),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getSenderInitials(selectedEmail.sender)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedEmail.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {selectedEmail.sender}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogTitle>

            <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

            <DialogContent sx={{ pt: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  fontSize: "1rem",
                }}
              >
                {getFullEmailContent(selectedEmail)}
              </Typography>
            </DialogContent>

            <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button
                startIcon={<ReplyIcon />}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
                }}
              >
                Reply
              </Button>
              <Button startIcon={<DeleteIcon />} color="error">
                Delete
              </Button>
              <Button onClick={() => setSelectedEmail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EmailView;
