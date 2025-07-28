import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { TextFieldWithDebounce } from './TextFieldWithDebounce';
import { SpacingControl } from './SpacingControl';
import { SpacingConfig } from '../../types/PatternVariant';
import { UnknownObject } from '../../types/common';

export interface PropControl {
  name: string;
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'
    | 'slider'
    | 'variant'
    | 'spacing'
    | 'size'
    | 'padding'
    | 'margin'
    | 'typography';
  label: string;
  defaultValue?: string | number | boolean | SpacingConfig | UnknownObject;
  options?: { label: string; value: string | number | boolean }[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  group?: string;
  isContent?: boolean; // Mark text/number fields as content vs settings
  isComponent?: boolean; // Mark boolean fields as component toggles
  componentGroup?: string; // Group related component controls (e.g., "Header", "Content", "Footer")
  sides?: ('top' | 'right' | 'bottom' | 'left')[]; // For spacing controls
  unit?: 'px' | '%'; // For size controls
}

interface PatternPropsPanelProps {
  controls: PropControl[];
  values: Record<string, string | number | boolean | SpacingConfig | UnknownObject>;
  onChange: (
    name: string,
    value: string | number | boolean | SpacingConfig | UnknownObject
  ) => void;
  onReset?: () => void;
  hideActions?: boolean;
}

export const PatternPropsPanel: React.FC<PatternPropsPanelProps> = ({
  controls,
  values,
  onChange,
  onReset,
  hideActions = false,
}) => {
  // Local state for props that haven't been saved yet
  const [localValues, setLocalValues] = useState<Record<string, any>>(values);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local values when parent values change (e.g., reset)
  useEffect(() => {
    setLocalValues(values);
    setHasChanges(false);
  }, [values]);

  const handleLocalChange = useCallback(
    (name: string, value: any) => {
      if (hideActions) {
        // For sub-components, update immediately
        onChange(name, value);
      } else {
        // For patterns, use local state with Update/Cancel
        setLocalValues((prev) => ({ ...prev, [name]: value }));
        setHasChanges(true);
      }
    },
    [hideActions, onChange]
  );

  const handleSave = useCallback(() => {
    // Apply all local changes to parent
    Object.keys(localValues).forEach((key) => {
      if (localValues[key] !== values[key]) {
        onChange(key, localValues[key]);
      }
    });
    setHasChanges(false);
  }, [localValues, values, onChange]);

  const handleCancel = useCallback(() => {
    setLocalValues(values);
    setHasChanges(false);
  }, [values]);

  // Separate content controls from settings controls
  const contentControls = controls.filter((c) => c.isContent);
  const settingsControls = controls.filter((c) => !c.isContent);

  const renderControl = useCallback(
    (control: PropControl) => {
      const value = hideActions
        ? (values[control.name] ?? control.defaultValue)
        : (localValues[control.name] ?? control.defaultValue);

      switch (control.type) {
        case 'text':
          return (
            <TextFieldWithDebounce
              fullWidth
              size="small"
              label={control.label}
              value={value || ''}
              onChange={(val) => handleLocalChange(control.name, val)}
              helperText={control.helperText}
            />
          );

        case 'number':
          return (
            <TextFieldWithDebounce
              fullWidth
              size="small"
              type="number"
              label={control.label}
              value={value || 0}
              onChange={(val) => handleLocalChange(control.name, val)}
              helperText={control.helperText}
            />
          );

        case 'boolean':
          return (
            <FormControlLabel
              control={
                <Switch
                  checked={!!value}
                  onChange={(e) => handleLocalChange(control.name, e.target.checked)}
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
                    onClick={() => handleLocalChange(control.name, option.value)}
                    data-ai-ignore="true"
                    sx={(theme) => ({
                      bgcolor:
                        value === option.value
                          ? theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.light'
                          : theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.200',
                      color:
                        value === option.value
                          ? theme.palette.mode === 'dark'
                            ? 'primary.contrastText'
                            : 'primary.main'
                          : 'text.secondary',
                      fontWeight: value === option.value ? 600 : 400,
                      border:
                        value === option.value
                          ? `1px solid ${theme.palette.primary.main}`
                          : '1px solid transparent',
                      '&:hover': {
                        bgcolor:
                          value === option.value
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
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
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
                value={value || control.min || 0}
                onChange={(_, newValue) => handleLocalChange(control.name, newValue)}
                min={control.min || 0}
                max={control.max || 100}
                step={control.step || 1}
                marks
                valueLabelDisplay="auto"
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
                    onClick={() => handleLocalChange(control.name, option.value)}
                    data-ai-ignore="true"
                    sx={(theme) => ({
                      bgcolor:
                        value === option.value
                          ? theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.light'
                          : theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.200',
                      color:
                        value === option.value
                          ? theme.palette.mode === 'dark'
                            ? 'primary.contrastText'
                            : 'primary.main'
                          : 'text.secondary',
                      fontWeight: value === option.value ? 600 : 400,
                      border:
                        value === option.value
                          ? `1px solid ${theme.palette.primary.main}`
                          : '1px solid transparent',
                      '&:hover': {
                        bgcolor:
                          value === option.value
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
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {control.helperText}
                </Typography>
              )}
            </Box>
          );

        case 'padding':
        case 'margin':
          const spacingValue = (value as SpacingConfig) || {
            top: control.defaultValue?.top || 16,
            right: control.defaultValue?.right || 16,
            bottom: control.defaultValue?.bottom || 16,
            left: control.defaultValue?.left || 16,
          };
          return (
            <SpacingControl
              label={control.label}
              value={spacingValue}
              onChange={(newValue) => handleLocalChange(control.name, newValue)}
              helperText={control.helperText}
            />
          );

        default:
          return null;
      }
    },
    [handleLocalChange, localValues, hideActions, values]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {hideActions ? 'Component Properties' : 'Props & Settings'}
        </Typography>
        {!hideActions && (
          <Stack direction="row" spacing={1}>
            {hasChanges && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  color="primary"
                >
                  Update
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  color="inherit"
                >
                  Cancel
                </Button>
              </>
            )}
            {onReset && !hasChanges && (
              <Button size="small" variant="outlined" onClick={onReset} color="inherit">
                Reset
              </Button>
            )}
          </Stack>
        )}
      </Box>

      <Stack spacing={3}>
        {/* Content controls (text/number inputs) */}
        {contentControls.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Content
            </Typography>
            <Stack spacing={2}>
              {contentControls.map((control) => (
                <Box key={control.name}>{renderControl(control)}</Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Settings controls (everything else) */}
        {settingsControls.length > 0 && (
          <Box>
            {contentControls.length > 0 && (
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Settings
              </Typography>
            )}
            <Stack spacing={2}>
              {settingsControls.map((control) => (
                <Box key={control.name}>{renderControl(control)}</Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

// Memoize to prevent unnecessary re-renders
export const MemoizedPatternPropsPanel = React.memo(PatternPropsPanel, (prevProps, nextProps) => {
  // Only re-render if controls or values have actually changed
  return (
    prevProps.controls === nextProps.controls &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.hideActions === nextProps.hideActions
  );
});
