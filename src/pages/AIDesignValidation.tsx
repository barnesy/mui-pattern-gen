import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack,
  Button,
  Alert,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DataDisplayCard } from '../patterns/pending/DataDisplayCard';
import { PropsDisplay } from '../patterns/debug/PropsDisplay';
import { withPatternWrapper } from '../utils/withPatternWrapper';
import { useAIDesignMode } from '../contexts/AIDesignModeContext';

// Wrap components for AI Design Mode
const WrappedDataDisplayCard = withPatternWrapper(DataDisplayCard, {
  patternName: 'DataDisplayCard',
  status: 'pending',
  category: 'cards',
});

const WrappedPropsDisplay = withPatternWrapper(PropsDisplay, {
  patternName: 'PropsDisplay',
  status: 'accepted',
  category: 'debug',
});

export const AIDesignValidation: React.FC = () => {
  const { isEnabled, selectedPattern, updatePatternInstance, updateAllPatternInstances } = useAIDesignMode();
  const [manualTitle, setManualTitle] = useState('Test Title');
  const [manualSubtitle, setManualSubtitle] = useState('Test Subtitle');
  const [updateAll, setUpdateAll] = useState(true);
  

  const handleManualUpdate = () => {
    if (!selectedPattern) {
      alert('Please select a pattern first by clicking on it');
      return;
    }

    const newProps = {
      title: manualTitle,
      subtitle: manualSubtitle,
      variant: 'stats',
    };

    if (updateAll) {
      updateAllPatternInstances(selectedPattern.name, newProps);
    } else {
      updatePatternInstance(selectedPattern.instanceId, newProps);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Design Mode Validation
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Test Instructions:</strong>
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            1. Enable AI Design Mode (currently: {isEnabled ? 'ON' : 'OFF'})
          </Typography>
          <Typography variant="body2">
            2. Click on any pattern below to select it
          </Typography>
          <Typography variant="body2">
            3. Use the Pattern Inspector drawer OR the manual controls below
          </Typography>
          <Typography variant="body2">
            4. Watch the props update in real-time in the PropsDisplay component
          </Typography>
          <Typography variant="body2">
            5. Add ?debug=true to URL to see instance IDs
          </Typography>
        </Stack>
      </Alert>

      {/* Manual Update Controls */}
      <Paper sx={{ p: 3, mb: 4 }} data-ai-ignore="true">
        <Typography variant="h6" gutterBottom>
          Manual Update Controls
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Subtitle"
            value={manualSubtitle}
            onChange={(e) => setManualSubtitle(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={updateAll}
                onChange={(e) => setUpdateAll(e.target.checked)}
              />
            }
            label="Update all instances"
          />
          <Button
            variant="contained"
            onClick={handleManualUpdate}
            disabled={!isEnabled || !selectedPattern}
          >
            Update Selected Pattern
          </Button>
          {selectedPattern && (
            <Typography variant="caption" color="text.secondary">
              Selected: {selectedPattern.name} (Instance: {selectedPattern.instanceId.slice(-8)})
            </Typography>
          )}
        </Stack>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Test Patterns */}
      <Stack spacing={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Pattern 1: DataDisplayCard
          </Typography>
          <WrappedDataDisplayCard
            variant="stats"
            title="Revenue Overview"
            subtitle="Last 30 days"
            demoDataType="revenue"
            showMenuItems
            elevation={1}
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Test Pattern 2: PropsDisplay (shows current props)
          </Typography>
          <WrappedPropsDisplay
            title="Props Display Test"
            subtitle="This component shows its current props"
            variant="debug"
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Test Pattern 3: Multiple Instances
          </Typography>
          <Stack direction="row" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Instance A
              </Typography>
              <WrappedDataDisplayCard
                variant="list"
                title="Users List"
                subtitle="Active users"
                demoDataType="users"
                showAction
                elevation={1}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Instance B
              </Typography>
              <WrappedDataDisplayCard
                variant="table"
                title="Sales Table"
                subtitle="Q4 2023"
                demoDataType="sales"
                elevation={1}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};