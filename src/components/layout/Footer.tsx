// src/components/layout/Footer.tsx
import React from "react";
import { Box, Typography, Link, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <Box sx={{ mt: "auto", py: 2 }}>
      <Divider sx={{ mb: 2, opacity: 0.3 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Personal AI Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          •
        </Typography>
        <Link
          component={RouterLink}
          to="/legal/privacy-policy/"
          variant="body2"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Privacy Policy
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
