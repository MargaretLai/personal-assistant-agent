// src/components/layout/NavigationTabs.tsx
import React, { useState } from "react";
import { Box, Tabs, Tab, Paper, useTheme, useMediaQuery } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TaskIcon from "@mui/icons-material/Task";
import EmailIcon from "@mui/icons-material/Email";
import DashboardIcon from "@mui/icons-material/Dashboard";

interface NavigationTabsProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  const tabs = [
    { label: "Dashboard", icon: <DashboardIcon />, value: 0 },
    { label: "Chat", icon: <ChatIcon />, value: 1 },
    { label: "Calendar", icon: <CalendarTodayIcon />, value: 2 },
    { label: "Tasks", icon: <TaskIcon />, value: 3 },
    { label: "Emails", icon: <EmailIcon />, value: 4 },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        background: "linear-gradient(145deg, #1a1f35 0%, #242b42 100%)",
        border: "1px solid rgba(0, 212, 255, 0.2)",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{
          "& .MuiTabs-indicator": {
            background: "linear-gradient(90deg, #00d4ff 0%, #ff6b35 100%)",
            height: 3,
          },
          "& .MuiTab-root": {
            minHeight: 64,
            textTransform: "none",
            fontWeight: 500,
            color: "text.secondary",
            "&.Mui-selected": {
              color: "primary.main",
            },
            "&:hover": {
              color: "primary.light",
              backgroundColor: "rgba(0, 212, 255, 0.05)",
            },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{
              gap: 1,
              px: { xs: 1, md: 2 },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default NavigationTabs;
