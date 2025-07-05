// src/components/chat/ChatInterface.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { ChatMessage } from '../../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your personal assistant. I can help you manage your calendar, emails, tasks, and notes. What would you like to do?',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate agent response (we'll replace this with real AI later)
      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I received your message: "${inputValue}". I'm still learning, but I'll help you with that soon!`,
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 1000);
      
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages Area */}
      <Paper 
        variant="outlined" 
        sx={{ 
          flexGrow: 1, 
          p: 1, 
          mb: 2, 
          maxHeight: '400px', 
          overflowY: 'auto' 
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    color: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {message.sender === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <ListItemText primary={message.content} />
                </Paper>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          sx={{ alignSelf: 'flex-end' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface;