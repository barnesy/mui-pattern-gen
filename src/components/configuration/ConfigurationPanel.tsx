/**
 * Unified ConfigurationPanel component
 * Consolidates functionality from PatternPropsPanel, SchemaPropsForm, PurePropsForm, and AIDesignModeDrawer
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import { 
  Save, 
  Cancel, 
  Refresh, 
  ExpandMore,
  Search,
  Clear,
  Undo,
  Redo,
  AppsOutage,
} from '@mui/icons-material';

import {
  ConfigurationPanelProps,
  ConfigurationState,
  ConfigControl,
  ControlGroup,
  UpdateMode,
  UseConfigurationPanelReturn,
} from './types';
import { TextFieldWithDebounce } from '../patterns/TextFieldWithDebounce';
import { SpacingControl } from '../patterns/SpacingControl';
import { SpacingConfig } from '../../types/PatternVariant';
import { validateData } from '../../schemas/validation';
import { ComponentSchema } from '../../schemas/types';

/**
 * Hook for managing configuration panel state and logic
 */
export const useConfigurationPanel = ({
  source,
  values,
  onChange,
  updateMode = 'batched',
  onSave,
  onCancel,
  onReset,
  enableValidation = false,
  onValidationChange,
}: ConfigurationPanelProps): UseConfigurationPanelReturn => {
  
  // Convert source to controls
  const controls = useMemo(() => {
    if (source.type === 'controls') {
      return source.controls;
    } else {
      // Convert schema to controls
      return convertSchemaToControls(source.schema);
    }
  }, [source]);

  // Group controls
  const groups = useMemo(() => {
    const groupMap: Record<string, ConfigControl[]> = {};
    
    controls.forEach(control => {
      const groupName = control.group || 'General';
      if (!groupMap[groupName]) {
        groupMap[groupName] = [];
      }
      groupMap[groupName].push(control);
    });

    return Object.entries(groupMap).map(([name, controls]) => ({
      name,
      label: name,
      controls,
      defaultExpanded: name === 'General',
    }));
  }, [controls]);

  // Internal state
  const [state, setState] = useState<ConfigurationState>(() => ({
    localValues: { ...values },
    originalValues: { ...values },
    hasChanges: false,
    errors: {},
    isValid: true,
    expandedGroups: new Set(['General']),
  }));

  // Update local values when external values change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      localValues: { ...values },
      originalValues: { ...values },
      hasChanges: false,
      errors: {},
    }));
  }, [values]);

  // Validation function
  const validateField = useCallback((name: string, value: any): string | null => {
    if (!enableValidation) return null;

    const control = controls.find(c => c.name === name);
    if (!control) return null;

    // Required validation
    if (control.required && (value === undefined || value === null || value === '')) {
      return `${control.label} is required`;
    }

    // Custom validation
    if (control.validation?.custom) {
      return control.validation.custom(value);
    }

    // Pattern validation for strings
    if (control.type === 'text' && control.validation?.pattern && typeof value === 'string') {
      const pattern = typeof control.validation.pattern === 'string' 
        ? new RegExp(control.validation.pattern) 
        : control.validation.pattern;
      if (!pattern.test(value)) {
        return `${control.label} format is invalid`;
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (control.validation?.minLength && value.length < control.validation.minLength) {
        return `${control.label} must be at least ${control.validation.minLength} characters`;
      }
      if (control.validation?.maxLength && value.length > control.validation.maxLength) {
        return `${control.label} must be no more than ${control.validation.maxLength} characters`;
      }
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (control.min !== undefined && value < control.min) {
        return `${control.label} must be at least ${control.min}`;
      }
      if (control.max !== undefined && value > control.max) {
        return `${control.label} must be no more than ${control.max}`;
      }
    }

    return null;
  }, [controls, enableValidation]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    if (!enableValidation) return true;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    controls.forEach(control => {
      const value = state.localValues[control.name];
      const error = validateField(control.name, value);
      if (error) {
        newErrors[control.name] = error;
        isValid = false;
      }
    });

    setState(prev => ({ ...prev, errors: newErrors, isValid }));
    
    if (onValidationChange) {
      onValidationChange(newErrors, isValid);
    }

    return isValid;
  }, [controls, state.localValues, validateField, enableValidation, onValidationChange]);

  // Handle field change
  const handleChange = useCallback((name: string, value: any) => {
    setState(prev => {
      const newLocalValues = { ...prev.localValues, [name]: value };
      const hasChanges = JSON.stringify(newLocalValues) !== JSON.stringify(prev.originalValues);
      
      // Clear error for this field
      const newErrors = { ...prev.errors };
      delete newErrors[name];

      // Validate field if enabled
      if (enableValidation) {
        const error = validateField(name, value);
        if (error) {
          newErrors[name] = error;
        }
      }

      return {
        ...prev,
        localValues: newLocalValues,
        hasChanges,
        errors: newErrors,
      };
    });

    // For immediate mode, call onChange right away
    if (updateMode === 'immediate') {
      onChange(name, value);
    }
  }, [updateMode, onChange, validateField, enableValidation]);

  // Handle save
  const handleSave = useCallback(() => {
    if (enableValidation && !validateAll()) {
      return;
    }

    if (updateMode === 'batched') {
      // Apply all changes to parent
      Object.keys(state.localValues).forEach(key => {
        if (state.localValues[key] !== state.originalValues[key]) {
          onChange(key, state.localValues[key]);
        }
      });
    } else if (updateMode === 'explicit' && onSave) {
      onSave(state.localValues);
    }

    setState(prev => ({
      ...prev,
      originalValues: { ...prev.localValues },
      hasChanges: false,
      errors: {},
    }));
  }, [state.localValues, state.originalValues, updateMode, onChange, onSave, enableValidation, validateAll]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      localValues: { ...prev.originalValues },
      hasChanges: false,
      errors: {},
    }));

    if (onCancel) {
      onCancel();
    }
  }, [state.originalValues, onCancel]);

  // Handle reset
  const handleReset = useCallback(() => {
    const resetValues: Record<string, any> = {};
    controls.forEach(control => {
      if (control.defaultValue !== undefined) {
        resetValues[control.name] = control.defaultValue;
      }
    });

    setState(prev => ({
      ...prev,
      localValues: resetValues,
      originalValues: resetValues,
      hasChanges: false,
      errors: {},
    }));

    if (onReset) {
      onReset();
    } else {
      // Apply reset values immediately
      Object.keys(resetValues).forEach(key => {
        onChange(key, resetValues[key]);
      });
    }
  }, [controls, onChange, onReset]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupName: string) => {
    setState(prev => {
      const newExpandedGroups = new Set(prev.expandedGroups);
      if (newExpandedGroups.has(groupName)) {
        newExpandedGroups.delete(groupName);
      } else {
        newExpandedGroups.add(groupName);
      }
      return { ...prev, expandedGroups: newExpandedGroups };
    });
  }, []);

  return {
    state,
    actions: {
      handleChange,
      handleSave,
      handleCancel,
      handleReset,
      toggleGroup,
      validateField,
      validateAll,
    },
    groups,
    controls,
  };
};

/**
 * Individual control renderer component
 */
const ControlRenderer: React.FC<{
  control: ConfigControl;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
}> = React.memo(({ control, value, onChange, error, disabled = false, compact = false }) => {
  const currentValue = value ?? control.defaultValue;

  switch (control.type) {
    case 'text':
      return (
        <TextFieldWithDebounce
          fullWidth={!compact}
          size={compact ? 'small' : 'medium'}
          label={control.label}
          value={currentValue || ''}
          onChange={onChange}
          helperText={error || control.helperText}
          error={!!error}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <TextFieldWithDebounce
          fullWidth={!compact}
          size={compact ? 'small' : 'medium'}
          type="number"
          label={control.label}
          value={currentValue || 0}
          onChange={(val) => onChange(Number(val))}
          helperText={error || control.helperText}
          error={!!error}
          disabled={disabled}
          inputProps={{
            min: control.min,
            max: control.max,
            step: control.step,
          }}
        />
      );

    case 'boolean':
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!currentValue}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              size={compact ? 'small' : 'medium'}
            />
          }
          label={control.label}
        />
      );

    case 'select':
    case 'variant':
      if (!control.options || control.options.length <= 5) {
        // Use chips for small number of options
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {control.label}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {control.options?.map((option) => (
                <Chip
                  key={String(option.value)}
                  label={option.label}
                  size={compact ? 'small' : 'medium'}
                  onClick={() => onChange(option.value)}
                  disabled={disabled}
                  sx={(theme) => ({
                    bgcolor:
                      currentValue === option.value
                        ? theme.palette.mode === 'dark'
                          ? 'primary.dark'
                          : 'primary.light'
                        : theme.palette.mode === 'dark'
                          ? 'grey.800'
                          : 'grey.200',
                    color:
                      currentValue === option.value
                        ? theme.palette.mode === 'dark'
                          ? 'primary.contrastText'
                          : 'primary.main'
                        : 'text.secondary',
                    fontWeight: currentValue === option.value ? 600 : 400,
                    border:
                      currentValue === option.value
                        ? `1px solid ${theme.palette.primary.main}`
                        : '1px solid transparent',
                    '&:hover': {
                      bgcolor:
                        currentValue === option.value
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
            {(error || control.helperText) && (
              <Typography
                variant="caption"
                color={error ? 'error' : 'text.secondary'}
                sx={{ mt: 0.5, display: 'block' }}
              >
                {error || control.helperText}
              </Typography>
            )}
          </Box>
        );
      } else {
        // Use select for many options
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {control.label}
            </Typography>
            <Select
              fullWidth={!compact}
              size={compact ? 'small' : 'medium'}
              value={currentValue || ''}
              onChange={(e) => onChange(e.target.value)}
              error={!!error}
              disabled={disabled}
            >
              {control.options?.map((option) => (
                <MenuItem key={String(option.value)} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || control.helperText) && (
              <Typography
                variant="caption"
                color={error ? 'error' : 'text.secondary'}
                sx={{ mt: 0.5, display: 'block' }}
              >
                {error || control.helperText}
              </Typography>
            )}
          </Box>
        );
      }

    case 'slider':
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            {control.label}: {currentValue}
          </Typography>
          <Slider
            value={currentValue || control.min || 0}
            onChange={(_, newValue) => onChange(newValue)}
            min={control.min || 0}
            max={control.max || 100}
            step={control.step || 1}
            marks
            valueLabelDisplay="auto"
            disabled={disabled}
          />
          {(error || control.helperText) && (
            <Typography 
              variant="caption" 
              color={error ? 'error' : 'text.secondary'}
            >
              {error || control.helperText}
            </Typography>
          )}
        </Box>
      );

    case 'padding':
    case 'margin':
    case 'spacing':
      const spacingValue = (currentValue as SpacingConfig) || {
        top: typeof control.defaultValue === 'object' ? control.defaultValue?.top || 16 : 16,
        right: typeof control.defaultValue === 'object' ? control.defaultValue?.right || 16 : 16,
        bottom: typeof control.defaultValue === 'object' ? control.defaultValue?.bottom || 16 : 16,
        left: typeof control.defaultValue === 'object' ? control.defaultValue?.left || 16 : 16,
      };
      return (
        <SpacingControl
          label={control.label}
          value={spacingValue}
          onChange={onChange}
          helperText={error || control.helperText}
        />
      );

    case 'typography':
      // Custom typography control - similar to select but styled for typography
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {control.label}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {control.options?.map((option) => (
              <Chip
                key={String(option.value)}
                label={option.label}
                size={compact ? 'small' : 'medium'}
                onClick={() => onChange(option.value)}
                disabled={disabled}
                color={currentValue === option.value ? 'primary' : 'default'}
                variant={currentValue === option.value ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
          {(error || control.helperText) && (
            <Typography
              variant="caption"
              color={error ? 'error' : 'text.secondary'}
              sx={{ mt: 0.5, display: 'block' }}
            >
              {error || control.helperText}
            </Typography>
          )}
        </Box>
      );

    default:
      return (
        <Alert severity="warning">
          Unsupported control type: {control.type}
        </Alert>
      );
  }
});

/**
 * Main ConfigurationPanel component
 */
export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = (props) => {
  const {
    title = 'Configuration',
    hideActions = false,
    showGroupedAccordions = false,
    compactMode = false,
    updateMode = 'batched',
  } = props;

  const {
    state,
    actions,
    groups,
  } = useConfigurationPanel(props);

  // Separate content and settings controls (for backward compatibility with PatternPropsPanel)
  const contentControls = useMemo(() => 
    groups.flatMap(g => g.controls).filter(c => c.isContent),
    [groups]
  );
  
  const settingsControls = useMemo(() => 
    groups.flatMap(g => g.controls).filter(c => !c.isContent),
    [groups]
  );

  const shouldShowActions = !hideActions && updateMode !== 'immediate';
  const hasValidationErrors = Object.keys(state.errors).length > 0;

  return (
    <Paper sx={{ p: compactMode ? 1 : 2 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: compactMode ? 1 : 2 
      }}>
        <Typography variant={compactMode ? 'subtitle1' : 'h6'}>
          {title}
        </Typography>
        {shouldShowActions && (
          <Stack direction="row" spacing={1}>
            {state.hasChanges && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Save />}
                  onClick={actions.handleSave}
                  color="primary"
                >
                  {updateMode === 'explicit' ? 'Save' : 'Update'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={actions.handleCancel}
                  color="inherit"
                >
                  Cancel
                </Button>
              </>
            )}
            {!state.hasChanges && (
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={actions.handleReset} 
                color="inherit"
              >
                Reset
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {/* Content */}
      <Stack spacing={compactMode ? 2 : 3}>
        {showGroupedAccordions ? (
          // Grouped accordion view (for schema-based forms)
          groups.map((group) => (
            <Accordion 
              key={group.name} 
              expanded={state.expandedGroups.has(group.name)}
              onChange={() => actions.toggleGroup(group.name)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">{group.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={compactMode ? 1 : 2}>
                  {group.controls.map((control) => (
                    <Box key={control.name}>
                      <ControlRenderer
                        control={control}
                        value={state.localValues[control.name]}
                        onChange={(value) => actions.handleChange(control.name, value)}
                        error={state.errors[control.name]}
                        compact={compactMode}
                      />
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          // Flat view with content/settings separation (for pattern props panels)
          <>
            {/* Content controls */}
            {contentControls.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Content
                </Typography>
                <Stack spacing={compactMode ? 1 : 2}>
                  {contentControls.map((control) => (
                    <Box key={control.name}>
                      <ControlRenderer
                        control={control}
                        value={state.localValues[control.name]}
                        onChange={(value) => actions.handleChange(control.name, value)}
                        error={state.errors[control.name]}
                        compact={compactMode}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Settings controls */}
            {settingsControls.length > 0 && (
              <Box>
                {contentControls.length > 0 && (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Settings
                  </Typography>
                )}
                <Stack spacing={compactMode ? 1 : 2}>
                  {settingsControls.map((control) => (
                    <Box key={control.name}>
                      <ControlRenderer
                        control={control}
                        value={state.localValues[control.name]}
                        onChange={(value) => actions.handleChange(control.name, value)}
                        error={state.errors[control.name]}
                        compact={compactMode}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>

      {/* Validation errors summary */}
      {hasValidationErrors && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the errors above before {updateMode === 'explicit' ? 'saving' : 'updating'}
        </Alert>
      )}
    </Paper>
  );
};

/**
 * Utility function to convert ComponentSchema to ConfigControl[]
 */
function convertSchemaToControls(schema: ComponentSchema): ConfigControl[] {
  return schema.props.map(prop => ({
    name: prop.name,
    type: mapSchemaTypeToControlType(prop.type),
    label: prop.name,
    required: prop.required,
    defaultValue: prop.default,
    options: prop.options,
    description: prop.description,
    group: prop.group,
  }));
}

/**
 * Map schema prop types to control types
 */
function mapSchemaTypeToControlType(schemaType: string): any {
  switch (schemaType) {
    case 'string': return 'text';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'enum': return 'select';
    case 'object': return 'spacing'; // Default for objects, can be customized
    default: return 'text';
  }
}

/**
 * Memoized version for performance
 */
export const MemoizedConfigurationPanel = React.memo(ConfigurationPanel, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    prevProps.source === nextProps.source &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.updateMode === nextProps.updateMode &&
    prevProps.hideActions === nextProps.hideActions
  );
});