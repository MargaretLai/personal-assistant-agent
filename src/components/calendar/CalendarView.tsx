// src/components/calendar/CalendarView.tsx - Replace the events state and functions
import React, { useState, useEffect } from "react";
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
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { CalendarEvent } from "../../types";
import { calendarAPI } from "../../services/apiService";
import {
  convertApiEventToFrontend,
  convertFrontendEventToApi,
} from "../../utils/dataConverters";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
  });

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await calendarAPI.getEvents();
        const apiEvents = response.data.results;
        const convertedEvents = apiEvents.map(convertApiEventToFrontend);
        setEvents(convertedEvents);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError("Failed to load calendar events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEventColor = (event: CalendarEvent) => {
    if (
      event.title.toLowerCase().includes("meeting") ||
      event.title.toLowerCase().includes("standup")
    ) {
      return "#00d4ff";
    } else if (event.title.toLowerCase().includes("presentation")) {
      return "#ff6b35";
    } else if (
      event.title.toLowerCase().includes("doctor") ||
      event.title.toLowerCase().includes("appointment")
    ) {
      return "#00ff88";
    }
    return "#ffb347";
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach((event) => {
      const dateKey = event.start.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const handleNewEvent = () => {
    setShowNewEventDialog(true);
  };

  const handleSaveNewEvent = async () => {
    if (newEvent.title.trim()) {
      try {
        const startDateTime = new Date(
          `${newEvent.date}T${newEvent.startTime}`
        );
        const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

        const eventData = convertFrontendEventToApi({
          title: newEvent.title,
          start: startDateTime,
          end: endDateTime,
          description: newEvent.description || undefined,
          location: newEvent.location || undefined,
        });

        // Add additional API-specific fields
        const apiEventData = {
          ...eventData,
          priority: "medium" as const,
        };

        const response = await calendarAPI.createEvent(apiEventData);
        const createdEvent = convertApiEventToFrontend(response.data);

        setEvents((prev) => [...prev, createdEvent]);
        setShowNewEventDialog(false);
        setSnackbarMessage(`Event "${newEvent.title}" created successfully!`);
        setSnackbarOpen(true);

        // Reset form
        setNewEvent({
          title: "",
          description: "",
          location: "",
          date: new Date().toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "10:00",
        });
      } catch (error) {
        console.error("Error creating event:", error);
        setSnackbarMessage("Failed to create event. Please try again.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCancelNewEvent = () => {
    setShowNewEventDialog(false);
    setNewEvent({
      title: "",
      description: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
    });
  };

  const groupedEvents = groupEventsByDate(events);

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
        <Typography variant="h6">Loading calendar events...</Typography>
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
            📅 Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your schedule and upcoming events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewEvent}
          sx={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #4de6ff 0%, #00d4ff 100%)",
            },
          }}
        >
          New Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
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
              background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
              border: "1px solid rgba(0, 212, 255, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "primary.main" }}
            >
              {formatDate(new Date(dateString))}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {dayEvents.map((event) => (
                <Card
                  key={event.id}
                  sx={{
                    cursor: "pointer",
                    background: `linear-gradient(135deg, ${getEventColor(
                      event
                    )}20 0%, ${getEventColor(event)}10 100%)`,
                    border: `1px solid ${getEventColor(event)}40`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${getEventColor(
                        event
                      )}30 0%, ${getEventColor(event)}20 100%)`,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {event.title}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <AccessTimeIcon fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="caption">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </Typography>
                    </Box>

                    {event.location && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocationOnIcon
                          fontSize="small"
                          sx={{ opacity: 0.7 }}
                        />
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

      {/* New Event Dialog */}
      <Dialog
        open={showNewEventDialog}
        onClose={handleCancelNewEvent}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon color="primary" />
            <Typography variant="h6">Create New Event</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <TextField
              fullWidth
              label="Location"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, location: e.target.value }))
              }
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, date: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="End Time"
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelNewEvent}>Cancel</Button>
          <Button
            onClick={handleSaveNewEvent}
            variant="contained"
            disabled={!newEvent.title.trim()}
            sx={{
              background: "linear-gradient(135deg, #00d4ff 0%, #0095cc 100%)",
            }}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EventIcon color="primary" />
                <Typography variant="h6" component="div">
                  {selectedEvent.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(selectedEvent.start)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(selectedEvent.start)} -{" "}
                      {formatTime(selectedEvent.end)}
                    </Typography>
                  </Box>
                </Box>

                {selectedEvent.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body1">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.description && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: 1,
                      }}
                    >
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSelectedEvent(null)}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalendarView;
