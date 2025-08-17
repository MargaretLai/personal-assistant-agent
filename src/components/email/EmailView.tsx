// src/components/email/EmailView.tsx
import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  TextField,
  Snackbar,
} from "@mui/material";
import { emailAPI } from "../../services/apiService";
import AddIcon from "@mui/icons-material/Add";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import ReplyIcon from "@mui/icons-material/Reply";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmailIcon from "@mui/icons-material/Email";
import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

interface Email {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  body?: string;
  date: string;
  is_read: boolean;
  thread_id: string;
  is_gmail?: boolean;
}

const EmailView: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for email actions
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Form state
  const [composeForm, setComposeForm] = useState({
    to_email: "",
    subject: "",
    body: "",
  });
  const [replyBody, setReplyBody] = useState("");

  // Fetch emails from API
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await emailAPI.getEmails({ max_results: 50 });
        setEmails(response.data.emails || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching emails:", err);
        setError("Failed to load emails");
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
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
      } else if (diffInHours < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Recently";
    }
  };

  const getFilteredEmails = () => {
    switch (activeTab) {
      case 0:
        return emails; // All
      case 1:
        return emails.filter((email) => !email.is_read); // Unread
      case 2:
        return emails.filter((email) => email.is_read); // Read
      default:
        return emails;
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMarkAsRead = async (
    emailId: string,
    event?: React.MouseEvent
  ) => {
    if (event) event.stopPropagation();

    try {
      setActionLoading(true);
      await emailAPI.markAsRead(emailId);

      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === emailId ? { ...email, is_read: true } : email
        )
      );

      showSnackbar("Email marked as read");
    } catch (error) {
      console.error("Error marking email as read:", error);
      showSnackbar("Failed to mark email as read", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsUnread = async (
    emailId: string,
    event?: React.MouseEvent
  ) => {
    if (event) event.stopPropagation();

    try {
      setActionLoading(true);
      await emailAPI.markAsUnread(emailId);

      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === emailId ? { ...email, is_read: false } : email
        )
      );

      showSnackbar("Email marked as unread");
    } catch (error) {
      console.error("Error marking email as unread:", error);
      showSnackbar("Failed to mark email as unread", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComposeSubmit = async () => {
    try {
      setActionLoading(true);
      await emailAPI.composeEmail(composeForm);

      showSnackbar("Email sent successfully!");
      setComposeOpen(false);
      setComposeForm({ to_email: "", subject: "", body: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      showSnackbar("Failed to send email", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedEmail) return;

    try {
      setActionLoading(true);
      await emailAPI.replyToEmail(selectedEmail.id, { body: replyBody });

      showSnackbar("Reply sent successfully!");
      setReplyOpen(false);
      setReplyBody("");
    } catch (error) {
      console.error("Error sending reply:", error);
      showSnackbar("Failed to send reply", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      handleMarkAsRead(email.id);
    }
  };

  const getEmailContent = (email: Email) => {
    return (
      email.body || email.snippet + "\n\n[Full email content from Gmail...]"
    );
  };

  const getSenderInitials = (sender: string) => {
    // Extract name from email format "Name <email@domain.com>" or just "email@domain.com"
    const nameMatch = sender.match(/^([^<]+)</);
    const name = nameMatch ? nameMatch[1].trim() : sender.split("@")[0];

    const parts = name.split(/[\s\.]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getSenderColor = (sender: string) => {
    const colors = ["#00d4ff", "#ff6b35", "#00ff88", "#ffb347", "#ff4757"];
    const hash = sender.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getSenderEmail = (sender: string) => {
    // Extract email from "Name <email@domain.com>" format
    if (sender.includes("<") && sender.includes(">")) {
      return sender.split("<")[1].split(">")[0];
    }
    return sender;
  };

  const unreadCount = emails.filter((email) => !email.is_read).length;

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading emails...</Typography>
      </Box>
    );
  }

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
            Your Gmail inbox - real-time integration
          </Typography>
        </Box>

        {/* Compose Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setComposeOpen(true)}
          sx={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #0095cc 0%, #006b8f 100%)",
            },
          }}
        >
          Compose
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                opacity: email.is_read ? 0.8 : 1,
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
                        fontWeight: email.is_read ? 400 : 600,
                        fontSize: "1.1rem",
                      }}
                    >
                      {email.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(email.date)}
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
                {!email.is_read && (
                  <Chip
                    label="NEW"
                    color="primary"
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) =>
                      email.is_read
                        ? handleMarkAsUnread(email.id, e)
                        : handleMarkAsRead(email.id, e)
                    }
                    sx={{ opacity: 0.7 }}
                    disabled={actionLoading}
                  >
                    {email.is_read ? (
                      <MarkEmailUnreadIcon fontSize="small" />
                    ) : (
                      <MarkEmailReadIcon fontSize="small" />
                    )}
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmail(email);
                      setReplyOpen(true);
                    }}
                    sx={{ opacity: 0.7 }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Box>
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
                  justifyContent: "space-between",
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

                <IconButton onClick={() => setSelectedEmail(null)}>
                  <CloseIcon />
                </IconButton>
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
                {getEmailContent(selectedEmail)}
              </Typography>
            </DialogContent>

            <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button
                startIcon={<ReplyIcon />}
                variant="contained"
                onClick={() => {
                  setReplyOpen(true);
                }}
                sx={{
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
                }}
              >
                Reply
              </Button>
              <Button
                startIcon={
                  selectedEmail.is_read ? (
                    <MarkEmailUnreadIcon />
                  ) : (
                    <MarkEmailReadIcon />
                  )
                }
                onClick={() =>
                  selectedEmail.is_read
                    ? handleMarkAsUnread(selectedEmail.id)
                    : handleMarkAsRead(selectedEmail.id)
                }
                disabled={actionLoading}
              >
                {selectedEmail.is_read ? "Mark Unread" : "Mark Read"}
              </Button>
              <Button onClick={() => setSelectedEmail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Compose Email Dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6">Compose New Email</Typography>
        </DialogTitle>

        <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="To"
              fullWidth
              value={composeForm.to_email}
              onChange={(e) =>
                setComposeForm({ ...composeForm, to_email: e.target.value })
              }
              placeholder="recipient@example.com"
            />

            <TextField
              label="Subject"
              fullWidth
              value={composeForm.subject}
              onChange={(e) =>
                setComposeForm({ ...composeForm, subject: e.target.value })
              }
              placeholder="Email subject"
            />

            <TextField
              label="Message"
              fullWidth
              multiline
              rows={8}
              value={composeForm.body}
              onChange={(e) =>
                setComposeForm({ ...composeForm, body: e.target.value })
              }
              placeholder="Type your message here..."
            />
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            startIcon={<SendIcon />}
            variant="contained"
            onClick={handleComposeSubmit}
            disabled={
              actionLoading ||
              !composeForm.to_email ||
              !composeForm.subject ||
              !composeForm.body
            }
            sx={{
              background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            }}
          >
            {actionLoading ? "Sending..." : "Send"}
          </Button>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6">
            Reply to: {selectedEmail?.subject}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To: {selectedEmail ? getSenderEmail(selectedEmail.sender) : ""}
          </Typography>
        </DialogTitle>

        <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Your Reply"
            fullWidth
            multiline
            rows={8}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Type your reply here..."
          />
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.2)" }} />

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            startIcon={<SendIcon />}
            variant="contained"
            onClick={handleReplySubmit}
            disabled={actionLoading || !replyBody.trim()}
            sx={{
              background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            }}
          >
            {actionLoading ? "Sending..." : "Send Reply"}
          </Button>
          <Button onClick={() => setReplyOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailView;
