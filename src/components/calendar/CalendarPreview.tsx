// src/components/calendar/CalendarPreview.tsx
import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { CalendarEvent } from "../../types";
import { getTodaysEvents } from "../../services/mockData";

const CalendarPreview: React.FC = () => {
  const todaysEvents = getTodaysEvents();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: "250px", overflow: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Today's Schedule
      </Typography>

      {todaysEvents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No events scheduled for today
        </Typography>
      ) : (
        <List dense>
          {todaysEvents.map((event) => (
            <ListItem key={event.id} sx={{ px: 0 }}>
              <ListItemText
                primary={event.title}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </Typography>
                    {event.location && (
                      <Chip
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
  );
};

export default CalendarPreview;
