import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Slider,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { PropControl } from './PatternPropsPanel';

// Re-export for compatibility
export type SettingControl = PropControl;

interface SettingsPanelProps {
  controls: PropControl[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  controls,
  values,
  onChange,
}) => {
  // Filter out content controls (text/number)
  const settingsControls = controls.filter(c => !c.isContent && ['boolean', 'select', 'slider', 'variant'].includes(c.type));
  
  // Group controls by their group property
  const groupedControls = settingsControls.reduce((acc, control) => {
    const group = control.group || 'Settings';
    if (!acc[group]) acc[group] = [];
    acc[group].push(control);
    return acc;
  }, {} as Record<string, PropControl[]>);

  const renderControl = useCallback((control: PropControl) => {
    const value = values[control.name] ?? control.defaultValue;

    switch (control.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => onChange(control.name, e.target.checked)}
                size="small"
              />
            }
            label={control.label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{control.label}</InputLabel>
            <Select
              value={value ?? control.defaultValue ?? ''}
              label={control.label}
              onChange={(e) => onChange(control.name, e.target.value)}
            >
              {control.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {control.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {control.helperText}
              </Typography>
            )}
          </FormControl>
        );

      case 'slider':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {control.label}: {value}
            </Typography>
            <Slider
              value={value ?? control.min ?? 0}
              onChange={(_, newValue) => onChange(control.name, newValue)}
              min={control.min || 0}
              max={control.max || 100}
              step={control.step || 1}
              marks
              valueLabelDisplay="auto"
              size="small"
            />
            {control.helperText && (
              <Typography variant="caption" color="text.secondary">
                {control.helperText}
              </Typography>
            )}
          </Box>
        );

      case 'variant':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {control.label}
            </Typography>
            <ToggleButtonGroup
              value={value || control.defaultValue}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  onChange(control.name, newValue);
                }
              }}
              size="small"
              fullWidth
            >
              {control.options?.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {control.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {control.helperText}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  }, [onChange, values]);

  // If no settings controls, show a message
  if (settingsControls.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No settings available for this pattern
        </Typography>
      </Paper>
    );
  }

  // If only one group, show without accordion
  const groupNames = Object.keys(groupedControls);
  if (groupNames.length === 1) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Settings</Typography>
        <Stack spacing={2}>
          {groupedControls[groupNames[0]].map((control) => (
            <Box key={control.name}>
              {renderControl(control)}
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  // Multiple groups - use accordions
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Settings</Typography>
      <Stack spacing={1}>
        {Object.entries(groupedControls).map(([group, controls], index) => (
          <Accordion key={group} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{group}</Typography>
              <Chip
                label={controls.length}
                size="small"
                sx={{ ml: 'auto', mr: 1 }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {controls.map((control) => (
                  <Box key={control.name}>
                    {renderControl(control)}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Paper>
  );
};