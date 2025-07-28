import React, { memo } from 'react';
import { Box } from '@mui/material';

interface PatternPreviewProps {
  Component: React.ComponentType<any>;
  componentProps: Record<string, any>;
}

// Memoize the preview wrapper to prevent re-renders unless props actually change
export const PatternPreview = memo<PatternPreviewProps>(
  ({ Component, componentProps }) => {
    return (
      <Box sx={{ width: '100%', height: '100%' }}>
        <Component {...componentProps} />
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders
    // Only re-render if Component changes or if props deeply change
    if (prevProps.Component !== nextProps.Component) {
      return false;
    }

    // Deep compare props
    return JSON.stringify(prevProps.componentProps) === JSON.stringify(nextProps.componentProps);
  }
);
