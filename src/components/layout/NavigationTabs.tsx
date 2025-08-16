// src/components/layout/NavigationTabs.tsx
import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TaskIcon from "@mui/icons-material/Task";
import EmailIcon from "@mui/icons-material/Email";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user, logout } = useAuth();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  const handleLogout = () => {
    logout();
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Main Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            flex: 1,
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

        {/* User Info and Logout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pr: 2,
            borderLeft: "1px solid rgba(0, 212, 255, 0.1)",
            ml: 2,
            pl: 2,
          }}
        >
          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: { xs: "none", sm: "block" },
              }}
            >
              {user?.email || "User"}
            </Typography>
          </Box>

          {/* Logout Button */}
          <Tooltip title="Sign Out">
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "rgba(255, 71, 87, 0.1)",
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default NavigationTabs;
