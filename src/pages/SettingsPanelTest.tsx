import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Alert, Stack, Chip } from '@mui/material';
import { SettingsPanel } from '../components/patterns/SettingsPanel';
import { PropControl } from '../components/patterns/PatternPropsPanel';
import {
  labelValuePairControls,
  getSubComponentConfig,
} from '../components/AIDesignMode/subComponentConfigs';

// Test configuration with various control types
const testControls: PropControl[] = [
  {
    name: 'textProp',
    type: 'text',
    label: 'Text Input',
    defaultValue: 'Default Text',
    group: 'Test Group 1',
  },
  {
    name: 'numberProp',
    type: 'number',
    label: 'Number Input',
    defaultValue: 42,
    group: 'Test Group 1',
  },
  {
    name: 'booleanProp',
    type: 'boolean',
    label: 'Boolean Switch',
    defaultValue: true,
    group: 'Test Group 1',
  },
  {
    name: 'selectProp',
    type: 'select',
    label: 'Select Dropdown',
    defaultValue: 'option2',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
    group: 'Test Group 2',
  },
  {
    name: 'sliderProp',
    type: 'slider',
    label: 'Slider Control',
    defaultValue: 5,
    min: 0,
    max: 10,
    step: 1,
    group: 'Test Group 2',
  },
];

export const SettingsPanelTest: React.FC = () => {
  // Test 1: Basic SettingsPanel
  const [basicValues, setBasicValues] = useState<Record<string, unknown>>({
    textProp: 'Hello World',
    numberProp: 100,
    booleanProp: false,
    selectProp: 'option1',
    sliderProp: 7,
  });

  // Test 2: LabelValuePair config
  const [labelValuePairValues, setLabelValuePairValues] = useState<Record<string, unknown>>({
    label: 'Test Label',
    value: 'Test Value',
    variant: 'stacked',
    size: 'medium',
    valueColor: 'primary.main',
    showTrend: true,
    trend: 'up',
    trendValue: '+25%',
  });

  // Test 3: Empty config
  const [emptyValues, setEmptyValues] = useState<Record<string, unknown>>({});

  const handleBasicChange = (name: string, value: unknown) => {
    console.log('Basic change:', name, value);
    setBasicValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLabelValuePairChange = (name: string, value: unknown) => {
    console.log('LabelValuePair change:', name, value);
    setLabelValuePairValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        SettingsPanel Test Page
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests the SettingsPanel component with various configurations
      </Alert>

      {/* Test 1: Basic Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 1: Basic Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Testing all control types with a simple configuration
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2">Current Values:</Typography>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {JSON.stringify(basicValues, null, 2)}
          </pre>
        </Box>

        <Divider sx={{ my: 2 }} />

        <SettingsPanel
          controls={testControls}
          values={basicValues}
          onChange={handleBasicChange}
          debug={true}
        />
      </Paper>

      {/* Test 2: LabelValuePair Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 2: LabelValuePair Sub-Component Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Testing the exact configuration used for LabelValuePair sub-components
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">Config loaded:</Typography>
            <Chip
              label={labelValuePairControls.length > 0 ? 'YES' : 'NO'}
              color={labelValuePairControls.length > 0 ? 'success' : 'error'}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              ({labelValuePairControls.length} controls)
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2">Current Values:</Typography>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {JSON.stringify(labelValuePairValues, null, 2)}
          </pre>
        </Box>

        <Divider sx={{ my: 2 }} />

        <SettingsPanel
          controls={labelValuePairControls}
          values={labelValuePairValues}
          onChange={handleLabelValuePairChange}
        />
      </Paper>

      {/* Test 3: Dynamic Config Loading */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 3: Dynamic Sub-Component Config Loading
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Testing getSubComponentConfig function
        </Typography>

        <Box sx={{ mt: 2 }}>
          {['LabelValuePair', 'UnknownComponent'].map((componentType) => {
            const config = getSubComponentConfig(componentType);
            return (
              <Box key={componentType} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{componentType}:</Typography>
                  <Chip
                    label={config ? `${config.length} controls` : 'No config'}
                    color={config ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Test 4: Empty Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test 4: Empty Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Testing SettingsPanel with no controls
        </Typography>

        <Divider sx={{ my: 2 }} />

        <SettingsPanel controls={[]} values={emptyValues} onChange={() => {}} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Should show "No settings available" message
        </Typography>
      </Paper>

      {/* Debug Info */}
      <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          Debug Information
        </Typography>
        <Typography variant="body2" gutterBottom>
          Check browser console for onChange events
        </Typography>
        <Typography variant="body2" gutterBottom>
          LabelValuePair controls count: {labelValuePairControls.length}
        </Typography>
        <Typography variant="body2" gutterBottom>
          First control: {labelValuePairControls[0]?.name} ({labelValuePairControls[0]?.type})
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Control Types in LabelValuePair:
        </Typography>
        {labelValuePairControls.map((control, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
            • {control.name}: <Chip label={control.type} size="small" />
          </Typography>
        ))}
        <Divider sx={{ my: 2 }} />
        <Alert severity="warning">
          <Typography variant="body2">
            SettingsPanel filters out 'text' and 'number' controls!
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Line 34-36 in SettingsPanel.tsx filters these out as 'content' controls
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};
