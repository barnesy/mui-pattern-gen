import React from 'react';
import { Box, useTheme } from '@mui/material';

export const PatternLoading: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 300,
        p: 4
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        {/* Background circle */}
        <circle
          cx="30"
          cy="30"
          r="25"
          stroke={theme.palette.divider}
          strokeWidth="4"
          fill="none"
        />
        {/* Animated progress circle */}
        <circle
          cx="30"
          cy="30"
          r="25"
          stroke={theme.palette.primary.main}
          strokeWidth="4"
          fill="none"
          strokeDasharray="100 57"
          strokeLinecap="round"
          style={{
            transformOrigin: '30px 30px',
          }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Inner pulsing circle */}
        <circle
          cx="30"
          cy="30"
          r="8"
          fill={theme.palette.primary.main}
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values="8;12;8"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </Box>
  );
};