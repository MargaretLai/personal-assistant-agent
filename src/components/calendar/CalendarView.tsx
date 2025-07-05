// src/components/calendar/CalendarView.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CalendarEvent } from '../../types';
import { mockCalendarEvents } from '../../services/mockData';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';

const CalendarView: React.FC = () => {
  const [events] = useState(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.title.toLowerCase().includes('meeting') || event.title.toLowerCase().includes('standup')) {
      return '#00d4ff';
    } else if (event.title.toLowerCase().includes('presentation')) {
      return '#ff6b35';
    } else if (event.title.toLowerCase().includes('doctor') || event.title.toLowerCase().includes('appointment')) {
      return '#00ff88';
    }
    return '#ffb347';
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const dateKey = event.start.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            📅 Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your schedule and upcoming events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4de6ff 0%, #00d4ff 100%)',
            },
          }}
        >
          New Event
        </Button>
      </Box>

      {/* Calendar Grid - Using Flexbox instead of Material-UI Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {Object.entries(groupedEvents).map(([dateString, dayEvents]) => (
          <Paper
            key={dateString}
            elevation={2}
            sx={{
              p: 2,
              background: 'linear-gradient(145deg, #1a1f35 0%, #242b42 100%)',
              border: '1px solid rgba(0, 212, 255, 0.1)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              {formatDate(new Date(dateString))}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dayEvents.map((event) => (
                <Card
                  key={event.id}
                  sx={{
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${getEventColor(event)}20 0%, ${getEventColor(event)}10 100%)`,
                    border: `1px solid ${getEventColor(event)}40`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${getEventColor(event)}30 0%, ${getEventColor(event)}20 100%)`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="caption">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </Typography>
                    </Box>
                    
                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" sx={{ opacity: 0.7 }} />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                <Typography variant="h6" component="div">
                  {selectedEvent.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(selectedEvent.start)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                    </Typography>
                  </Box>
                </Box>
                
                {selectedEvent.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body1">{selectedEvent.location}</Typography>
                  </Box>
                )}
                
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                      borderRadius: 1 
                    }}>
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarView;