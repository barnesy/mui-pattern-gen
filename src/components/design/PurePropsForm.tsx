import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { ComponentSchema, PropSchema } from '../../schemas/types';
import { ComponentInstance } from '../../contexts/DesignSystemContext';
import { SimpleInput } from './SimpleInput';

export interface PurePropsFormProps {
  schema: ComponentSchema;
  instance: ComponentInstance;
  onSave: (props: Record<string, any>) => void;
  onCancel?: () => void;
}

/**
 * Pure React props form with local state and explicit save/cancel
 */
export const PurePropsForm: React.FC<PurePropsFormProps> = ({
  schema,
  instance,
  onSave,
  onCancel,
}) => {
  // Local state - completely isolated from parent
  const [localValues, setLocalValues] = useState(instance.props);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset local state when instance changes (switching components)
  useEffect(() => {
    setLocalValues(instance.props);
    setIsDirty(false);
    setErrors({});
  }, [instance.id, instance.props]);

  // Group props by category
  const propGroups = React.useMemo(() => {
    const groups: Record<string, PropSchema[]> = {};

    schema.props.forEach((prop) => {
      const group = prop.group || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(prop);
    });

    return groups;
  }, [schema.props]);

  // Handle local value change
  const handleChange = (name: string, value: any) => {
    setLocalValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle save
  const handleSave = () => {
    // Basic validation
    const newErrors: Record<string, string> = {};

    schema.props.forEach((prop) => {
      if (prop.required && !localValues[prop.name]) {
        newErrors[prop.name] = `${prop.label || prop.name} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(localValues);
    setIsDirty(false);
    setErrors({});
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalValues(instance.props);
    setIsDirty(false);
    setErrors({});
    onCancel?.();
  };

  // Render control based on prop type
  const renderControl = (prop: PropSchema) => {
    const value = localValues[prop.name] ?? prop.default ?? '';
    const error = errors[prop.name];

    switch (prop.type) {
      case 'string':
        return (
          <SimpleInput
            fullWidth
            label={prop.label || prop.name}
            value={value || ''}
            onChange={(e) => handleChange(prop.name, e.target.value)}
            error={!!error}
            helperText={error || prop.description}
          />
        );

      case 'number':
        return (
          <SimpleInput
            fullWidth
            type="number"
            label={prop.label || prop.name}
            value={value ?? 0}
            onChange={(e) => handleChange(prop.name, Number(e.target.value))}
            error={!!error}
            helperText={error || prop.description}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleChange(prop.name, e.target.checked)}
              />
            }
            label={prop.label || prop.name}
          />
        );

      case 'enum':
        if (!prop.options || prop.options.length <= 5) {
          // Use chips for small number of options
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {prop.label || prop.name}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {prop.options?.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    size="small"
                    color={value === option.value ? 'primary' : 'default'}
                    onClick={() => handleChange(prop.name, option.value)}
                  />
                ))}
              </Stack>
              {(error || prop.description) && (
                <Typography
                  variant="caption"
                  color={error ? 'error' : 'text.secondary'}
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {error || prop.description}
                </Typography>
              )}
            </Box>
          );
        } else {
          // Use select for many options
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {prop.label || prop.name}
              </Typography>
              <Select
                fullWidth
                size="small"
                value={value || ''}
                onChange={(e) => handleChange(prop.name, e.target.value)}
                error={!!error}
              >
                {prop.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {(error || prop.description) && (
                <Typography
                  variant="caption"
                  color={error ? 'error' : 'text.secondary'}
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {error || prop.description}
                </Typography>
              )}
            </Box>
          );
        }

      default:
        return <Alert severity="info">{prop.type} editor not implemented</Alert>;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {schema.name} Properties
      </Typography>

      {/* Props grouped by category */}
      {Object.entries(propGroups).map(([group, props]) => (
        <Accordion key={group} defaultExpanded={group === 'General'}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">{group}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {props.map((prop) => (
                <Box key={prop.name}>{renderControl(prop)}</Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Action buttons */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="outlined" size="small" onClick={handleCancel} disabled={!isDirty}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </Box>

      {/* Validation errors summary */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the errors above before saving
        </Alert>
      )}

      {/* Component metadata */}
      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          ID: {instance.id}
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Schema: {schema.id}
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Updated: {new Date(instance.metadata?.updatedAt || 0).toLocaleTimeString()}
        </Typography>
      </Box>
    </Paper>
  );
};
