import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const Debug: React.FC = () => {
  const theme = useTheme();
  
  React.useEffect(() => {
    console.log('Debug Component Mounted');
    console.log('Theme:', theme);
    console.log('Body computed styles:', window.getComputedStyle(document.body));
    console.log('Root element:', document.getElementById('root'));
    console.log('MUI components on page:', document.querySelectorAll('[class*="Mui"]').length);
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
        zIndex: 9999 
      }}
    >
      <Typography variant="caption">
        Theme Mode: {theme.palette.mode}
      </Typography>
    </Box>
  );
};