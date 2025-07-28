import React, { useState, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { ComponentSchema, PropSchema } from '../../schemas/types';
import { validateData } from '../../schemas/validation';
import { SpacingControl } from '../patterns/SpacingControl';
import { TypographyControl } from '../patterns/TypographyControl';
import { SimpleInput } from './SimpleInput';

export interface SchemaPropsFormProps {
  schema: ComponentSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  showActions?: boolean;
}

/**
 * Form component that generates controls from a component schema
 */
export const SchemaPropsForm: React.FC<SchemaPropsFormProps> = React.memo(
  ({ schema, values, onChange, showActions = true }) => {
    const [localValues, setLocalValues] = useState(() => ({ ...values }));
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const prevValuesRef = React.useRef(values);

    // Update local values when external values change (e.g., when switching components)
    React.useEffect(() => {
      // Deep comparison to prevent unnecessary updates
      const hasChanged = JSON.stringify(prevValuesRef.current) !== JSON.stringify(values);
      if (hasChanged) {
        setLocalValues({ ...values });
        setIsDirty(false);
        setErrors({});
        prevValuesRef.current = values;
      }
    }, [values]);

    // Group props by category
    const propGroups = useMemo(() => {
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
    const handleChange = useCallback((name: string, value: any) => {
      setLocalValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      setIsDirty(true);

      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }, []);

    // Handle update
    const handleUpdate = useCallback(() => {
      // Validate if schema has validation rules
      if (schema.dataShape) {
        const result = validateData(localValues, schema.dataShape);
        if (!result.valid && result.errors) {
          const newErrors: Record<string, string> = {};
          result.errors.forEach((error) => {
            newErrors[error.path] = error.message;
          });
          setErrors(newErrors);
          return;
        }
      }

      onChange(localValues);
      setIsDirty(false);
      setErrors({});
    }, [localValues, onChange, schema.dataShape]);

    // Handle cancel
    const handleCancel = useCallback(() => {
      setLocalValues(values);
      setIsDirty(false);
      setErrors({});
    }, [values]);

    // Render control based on prop type
    const renderControl = useCallback(
      (prop: PropSchema) => {
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

          case 'object':
            // Handle special object types
            if (prop.name === 'padding' || prop.name === 'margin') {
              return (
                <SpacingControl
                  label={prop.label || prop.name}
                  value={value}
                  onChange={(newValue) => handleChange(prop.name, newValue)}
                />
              );
            }
            // TODO: Add generic object editor
            return <Alert severity="info">Object editor for "{prop.name}" not implemented</Alert>;

          default:
            return <Alert severity="warning">Unknown prop type: {prop.type}</Alert>;
        }
      },
      [localValues, errors, handleChange]
    );

    return (
      <Box>
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
        {showActions && (
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
            <Button variant="contained" size="small" onClick={handleUpdate} disabled={!isDirty}>
              Update
            </Button>
          </Box>
        )}

        {/* Validation errors summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the errors above before updating
          </Alert>
        )}
      </Box>
    );
  }
);

/**
 * Simplified props form without actions
 */
export const SchemaPropsInline: React.FC<{
  schema: ComponentSchema;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}> = React.memo(({ schema, values, onChange }) => {
  const renderControl = (prop: PropSchema) => {
    const value = values[prop.name] ?? prop.default;

    switch (prop.type) {
      case 'string':
        return (
          <SimpleInput
            fullWidth
            value={value || ''}
            onChange={(e) => onChange(prop.name, e.target.value)}
            placeholder={prop.label || prop.name}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={!!value}
            onChange={(e) => onChange(prop.name, e.target.checked)}
            size="small"
          />
        );

      // Add more inline controls as needed
      default:
        return null;
    }
  };

  return (
    <Stack spacing={1}>
      {schema.props.map((prop) => {
        const control = renderControl(prop);
        if (!control) {return null;}

        return (
          <Box key={prop.name} display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" sx={{ minWidth: 100 }}>
              {prop.label || prop.name}
            </Typography>
            <Box flex={1}>{control}</Box>
          </Box>
        );
      })}
    </Stack>
  );
});
