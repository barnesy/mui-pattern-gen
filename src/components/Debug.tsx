import React from 'react';
import { Typography, Paper } from '@mui/material';

export const Debug: React.FC = () => {
  // Remove useLocation since Debug is rendered outside Router
  const pathname = window.location.pathname;
  
  return (
    <Paper
      className="debug-panel"
      data-ai-ignore="true"
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        p: 2,
        maxWidth: 300,
        zIndex: 9998,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: 'primary.main',
        pointerEvents: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Debug Info
      </Typography>
      <Typography variant="body2">
        Current Path: {pathname}
      </Typography>
      <Typography variant="body2">
        Components Found: {document.querySelectorAll('[class*="Mui"]').length}
      </Typography>
    </Paper>
  );
};