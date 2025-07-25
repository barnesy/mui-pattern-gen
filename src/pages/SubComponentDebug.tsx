import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { withPatternWrapper } from '../utils/withPatternWrapper';
import { SubComponentWrapper } from '../components/AIDesignMode/SubComponentWrapper';
import { useAIDesignMode } from '../contexts/AIDesignModeContext';

const AIDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'pending'
});

export const SubComponentDebug: React.FC = () => {
  const { isEnabled } = useAIDesignMode();
  
  // Simple test sub-component
  const TestSubComponent = () => (
    <SubComponentWrapper
      componentName="test-sub"
      componentType="debug"
      index={0}
      componentProps={{ test: true }}
    >
      <Paper sx={{ p: 2, m: 1, bgcolor: 'primary.light', color: 'white' }}>
        <Typography>Test Sub-Component</Typography>
        <Typography variant="caption">Click me when AI Mode is on!</Typography>
      </Paper>
    </SubComponentWrapper>
  );
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sub-Component Debug Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        AI Design Mode is: {isEnabled ? 'ENABLED' : 'DISABLED'}
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        1. Simple Sub-Component Test
      </Typography>
      <TestSubComponent />
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        2. DataDisplayCard with Sub-Components
      </Typography>
      <AIDataDisplayCard
        variant="stats"
        title="Debug Card"
        stats={[
          { label: 'Test Stat 1', value: '100', change: '+10%' },
          { label: 'Test Stat 2', value: '200', change: '-5%' }
        ]}
      />
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        3. DataDisplayCard with Label-Value Pairs
      </Typography>
      <AIDataDisplayCard
        variant="mixed"
        title="Mixed Content"
        labelValuePairs={[
          { label: 'Name', value: 'John Doe' },
          { label: 'Email', value: 'john@example.com' },
          { label: 'Status', value: 'Active' }
        ]}
      />
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Debug Info:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Enable AI Design Mode using the toggle in the app bar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Hover over components to see dashed outlines
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Click on sub-components to select them
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Check browser DevTools for data attributes
        </Typography>
      </Box>
    </Box>
  );
};