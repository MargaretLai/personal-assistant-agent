// src/components/calendar/CalendarPreview.tsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CalendarEvent } from "../../types";
import { calendarAPI } from "../../services/apiService";
import { convertApiEventToFrontend } from "../../utils/dataConverters";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const CalendarPreview: React.FC = () => {
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's events from API
  useEffect(() => {
    const fetchTodaysEvents = async () => {
      try {
        setLoading(true);
        const response = await calendarAPI.getTodaysEvents();
        const events = response.data.events.map(convertApiEventToFrontend);
        setTodaysEvents(events);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching today's events:", err);
        setError("Failed to load today's events");
        setTodaysEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysEvents();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins}m`;
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

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
            Loading today's events...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Today's Schedule
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {todaysEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {error ? "Unable to load events" : "No events scheduled for today"}
          </Typography>
        ) : (
          <List dense>
            {todaysEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  px: 0,
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                  },
                }}
                onClick={() => handleEventClick(event)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <IconButton size="small" sx={{ opacity: 0.7 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <AccessTimeIcon
                          fontSize="small"
                          sx={{ opacity: 0.7 }}
                        />
                        <Typography variant="caption">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </Typography>
                      </Box>
                      {event.location && (
                        <Chip
                          icon={<LocationOnIcon />}
                          label={event.location}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" component="div">
                {selectedEvent.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatTime(selectedEvent.start)} -{" "}
                      {formatTime(selectedEvent.end)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Duration:{" "}
                      {formatDuration(selectedEvent.start, selectedEvent.end)}
                    </Typography>
                  </Box>
                </Box>

                {selectedEvent.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body2">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.description && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Description:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default CalendarPreview;
