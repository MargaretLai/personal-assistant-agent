// src/components/chat/ChatInterface.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { ChatMessage } from "../../types";
import { aiAPI } from "../../services/apiService";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI personal assistant. I have access to your real calendar and tasks. Ask me about your schedule, pending tasks, or anything else you need help with! 🤖",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      try {
        // Call the real AI API
        const response = await aiAPI.sendMessage(
          inputValue,
          currentConversationId || undefined
        );

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.ai_response,
          sender: "agent",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update conversation ID for future messages
        if (response.data.conversation_id) {
          setCurrentConversationId(response.data.conversation_id);
        }
      } catch (err: any) {
        console.error("Error sending message to AI:", err);
        setError("Failed to get AI response. Please try again.");

        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: "agent",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Paper
        variant="outlined"
        sx={{
          flexGrow: 1,
          p: 2,
          mb: 2,
          maxHeight: "400px",
          overflowY: "auto",
          background: "rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                sx={{
                  flexDirection: "column",
                  alignItems:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        message.sender === "user"
                          ? "primary.main"
                          : "secondary.main",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {message.sender === "user" ? (
                      <PersonIcon />
                    ) : (
                      <SmartToyIcon />
                    )}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {message.sender === "user" ? "You" : "AI Assistant"}
                  </Typography>
                </Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    maxWidth: "80%",
                    background:
                      message.sender === "user"
                        ? "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)"
                        : "linear-gradient(135deg, #ff6b35 0%, #c4501a 100%)",
                    color: "white",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <ListItemText
                    primary={message.content}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "white",
                        fontWeight: 400,
                        whiteSpace: "pre-line",
                      },
                    }}
                  />
                </Paper>
              </ListItem>
              {index < messages.length - 1 && (
                <Divider sx={{ borderColor: "rgba(0, 212, 255, 0.1)" }} />
              )}
            </React.Fragment>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <ListItem
              sx={{ flexDirection: "column", alignItems: "flex-start", mb: 2 }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
              >
                <Avatar
                  sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}
                >
                  <SmartToyIcon />
                </Avatar>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  AI Assistant is thinking...
                </Typography>
              </Box>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #ff6b35 0%, #c4501a 100%)",
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress size={16} sx={{ color: "white" }} />
                <Typography variant="body2">Thinking...</Typography>
              </Paper>
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Input Area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Ask me about your schedule, tasks, or anything else..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          disabled={isLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0, 212, 255, 0.05)",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          sx={{
            alignSelf: "flex-end",
            background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4de6ff 0%, #00d4ff 100%)",
            },
            "&:disabled": {
              background: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface;
