import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { logger } from './services/logger';

export const Debug: React.FC = () => {
  const theme = useTheme();

  React.useEffect(() => {
    logger.debug('Debug Component Mounted', 'Debug');
    logger.debug('Theme:', 'Debug', theme);
    logger.debug('Body computed styles:', 'Debug', window.getComputedStyle(document.body));
    logger.debug('Root element:', 'Debug', document.getElementById('root'));
    logger.debug(
      'MUI components on page:',
      'Debug',
      document.querySelectorAll('[class*="Mui"]').length
    );
  }, [theme]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        zIndex: 9999,
      }}
    >
      <Typography variant="caption">Theme Mode: {theme.palette.mode}</Typography>
    </Box>
  );
};
