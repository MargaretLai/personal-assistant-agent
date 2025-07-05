// src/components/chat/ChatInterface.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { ChatMessage } from "../../types";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hello! I'm your personal assistant. I can help you manage your calendar, emails, tasks, and notes. What would you like to do?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Simulate agent response (we'll replace this with real AI later)
      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I received your message: "${inputValue}". I'm still learning, but I'll help you with that soon!`,
          sender: "agent",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      }, 1000);

      setInputValue("");
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
        </List>
      </Paper>

      {/* Input Area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0, 212, 255, 0.05)",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
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
