import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import { PropControl } from './PatternPropsPanel';
import { SpacingControl } from './SpacingControl';
import { SizeControl } from '../AIDesignMode/SizeControl';
import { SpacingConfig } from '../../types/PatternVariant';

// Re-export for compatibility
export type SettingControl = PropControl;

interface SettingsPanelProps {
  controls: PropControl[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(({
  controls,
  values,
  onChange,
}) => {
  // Filter out content controls (text/number)
  const settingsControls = controls.filter(c => !c.isContent && ['boolean', 'select', 'slider', 'variant', 'spacing', 'size', 'padding', 'margin'].includes(c.type));

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
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {control.label}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {control.options?.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  onClick={() => onChange(control.name, option.value)}
                  data-ai-ignore="true"
                  sx={(theme) => ({
                    bgcolor: value === option.value 
                      ? theme.palette.mode === 'dark' 
                        ? 'primary.dark' 
                        : 'primary.light' 
                      : theme.palette.mode === 'dark'
                        ? 'grey.800'
                        : 'grey.200',
                    color: value === option.value 
                      ? theme.palette.mode === 'dark'
                        ? 'primary.contrastText'
                        : 'primary.main'
                      : 'text.secondary',
                    fontWeight: value === option.value ? 600 : 400,
                    border: value === option.value 
                      ? `1px solid ${theme.palette.primary.main}` 
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: value === option.value 
                        ? theme.palette.mode === 'dark'
                          ? 'primary.dark' 
                          : 'primary.light'
                        : theme.palette.mode === 'dark'
                          ? 'grey.700'
                          : 'grey.300',
                    },
                  })}
                />
              ))}
            </Stack>
            {control.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {control.helperText}
              </Typography>
            )}
          </Box>
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {control.label}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {control.options?.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  size="small"
                  onClick={() => onChange(control.name, option.value)}
                  data-ai-ignore="true"
                  sx={(theme) => ({
                    bgcolor: value === option.value 
                      ? theme.palette.mode === 'dark' 
                        ? 'primary.dark' 
                        : 'primary.light' 
                      : theme.palette.mode === 'dark'
                        ? 'grey.800'
                        : 'grey.200',
                    color: value === option.value 
                      ? theme.palette.mode === 'dark'
                        ? 'primary.contrastText'
                        : 'primary.main'
                      : 'text.secondary',
                    fontWeight: value === option.value ? 600 : 400,
                    border: value === option.value 
                      ? `1px solid ${theme.palette.primary.main}` 
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: value === option.value 
                        ? theme.palette.mode === 'dark'
                          ? 'primary.dark' 
                          : 'primary.light'
                        : theme.palette.mode === 'dark'
                          ? 'grey.700'
                          : 'grey.300',
                    },
                  })}
                />
              ))}
            </Stack>
            {control.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {control.helperText}
              </Typography>
            )}
          </Box>
        );

      case 'spacing':
        return (
          <SpacingControl
            label={control.label}
            value={value || control.defaultValue || { top: 0, right: 0, bottom: 0, left: 0 }}
            onChange={(newValue) => onChange(control.name, newValue)}
            type={control.name as 'margin' | 'padding'}
            helperText={control.helperText}
          />
        );

      case 'size':
        return (
          <SizeControl
            label={control.label}
            value={value || control.defaultValue || { mode: 'auto' }}
            onChange={(newValue) => onChange(control.name, newValue)}
            min={control.min}
            max={control.max}
            step={control.step}
            helperText={control.helperText}
          />
        );

      case 'padding':
      case 'margin':
        const spacingValue = value as SpacingConfig || {
          top: control.defaultValue?.top || 16,
          right: control.defaultValue?.right || 16,
          bottom: control.defaultValue?.bottom || 16,
          left: control.defaultValue?.left || 16,
        };
        return (
          <SpacingControl
            label={control.label}
            value={spacingValue}
            onChange={(newValue) => onChange(control.name, newValue)}
            helperText={control.helperText}
          />
        );

      default:
        return null;
    }
  }, [onChange, values]);

  // If no settings controls, show a message
  if (settingsControls.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 2 }} data-ai-ignore="true">
        <Typography variant="body2" color="text.secondary" align="center">
          No settings available for this pattern
        </Typography>
      </Paper>
    );
  }

  // Show all controls directly without accordions
  return (
    <Paper elevation={0} data-ai-ignore="true">
      <Typography variant="h6" sx={{ px: 2, pt: 2, pb: 1 }}>Settings</Typography>
      <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
        {settingsControls.map((control) => (
          <Box key={control.name}>
            {renderControl(control)}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  // Only re-render if controls or values have actually changed
  return (
    prevProps.controls === nextProps.controls &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    prevProps.onChange === nextProps.onChange
  );
});