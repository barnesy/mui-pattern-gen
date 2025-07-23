import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
} from '@mui/material';
import { ExpandMore, Save, Cancel } from '@mui/icons-material';
import { TextFieldWithDebounce } from './TextFieldWithDebounce';

export interface PropControl {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'slider' | 'variant';
  label: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  group?: string;
}

interface PatternPropsPanelProps {
  controls: PropControl[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onReset?: () => void;
}

export const PatternPropsPanel: React.FC<PatternPropsPanelProps> = ({
  controls,
  values,
  onChange,
  onReset,
}) => {
  // Track expanded accordions with stable state
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['General']);
  
  // Local state for props that haven't been saved yet
  const [localValues, setLocalValues] = useState<Record<string, any>>(values);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Update local values when parent values change (e.g., reset)
  useEffect(() => {
    setLocalValues(values);
    setHasChanges(false);
  }, [values]);
  
  const handleLocalChange = useCallback((name: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  }, []);
  
  const handleSave = useCallback(() => {
    // Apply all local changes to parent
    Object.keys(localValues).forEach(key => {
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
  
  const handleAccordionChange = useCallback((panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev => {
      if (isExpanded) {
        return [...prev, panel];
      } else {
        return prev.filter(p => p !== panel);
      }
    });
  }, []);

  // Group controls by their group property
  const groupedControls = controls.reduce((acc, control) => {
    const group = control.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(control);
    return acc;
  }, {} as Record<string, PropControl[]>);

  const renderControl = useCallback((control: PropControl) => {
    const value = localValues[control.name] ?? control.defaultValue;

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
          <FormControl fullWidth size="small">
            <InputLabel>{control.label}</InputLabel>
            <Select
              value={value || ''}
              label={control.label}
              onChange={(e) => handleLocalChange(control.name, e.target.value)}
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
            <Typography variant="body2" gutterBottom>
              {control.label}
            </Typography>
            <ToggleButtonGroup
              value={value || control.defaultValue}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  handleLocalChange(control.name, newValue);
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
  }, [handleLocalChange, localValues]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Props & Settings</Typography>
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
            <Chip
              label="Reset"
              size="small"
              onClick={onReset}
              clickable
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      <Stack spacing={2}>
        {Object.entries(groupedControls).map(([group, groupControls]) => (
          <Accordion 
            key={group} 
            expanded={expandedPanels.includes(group)}
            onChange={handleAccordionChange(group)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{group}</Typography>
              <Chip
                label={groupControls.length}
                size="small"
                sx={{ ml: 'auto', mr: 1 }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {groupControls.map((control) => (
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