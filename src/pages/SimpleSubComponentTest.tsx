import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAIDesignMode } from '../contexts/AIDesignModeContext';

export const SimpleSubComponentTest: React.FC = () => {
  const { isEnabled } = useAIDesignMode();
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Simple Sub-Component Test
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        AI Design Mode is: <strong>{isEnabled ? 'ENABLED' : 'DISABLED'}</strong>
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Body has data-ai-mode: <strong>{document.body.getAttribute('data-ai-mode') || 'NOT SET'}</strong>
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Test Elements:</Typography>
        
        {/* Direct sub-component test */}
        <Paper 
          sx={{ p: 2, mb: 2 }}
          data-subcomponent-id="test-1"
        >
          <Typography>Direct Sub-Component (has data-subcomponent-id)</Typography>
          <Typography variant="caption">Should show dashed outline on hover when AI Mode is on</Typography>
        </Paper>
        
        {/* Pattern with sub-component */}
        <Box 
          data-pattern-name="TestPattern"
          data-pattern-status="pending"
          data-ai-mode="true"
          sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}
        >
          <Typography variant="h6">Pattern Container</Typography>
          <Paper 
            sx={{ p: 2, mt: 1 }}
            data-subcomponent-id="test-2"
          >
            <Typography>Sub-Component Inside Pattern</Typography>
            <Typography variant="caption">Should show dashed outline on hover</Typography>
          </Paper>
        </Box>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Instructions:
        </Typography>
        <ul>
          <li>Enable AI Design Mode</li>
          <li>Hover over the test elements above</li>
          <li>You should see dashed purple outlines on hover</li>
          <li>Check DevTools: Elements should have data-subcomponent-id attribute</li>
        </ul>
      </Box>
    </Box>
  );
};