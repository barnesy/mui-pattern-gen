import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { ComponentSchema } from '../../schemas/types';

export interface SimplePropsFormProps {
  schema: ComponentSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

/**
 * Simplified props form to test without TextField issues
 */
export const SimplePropsForm: React.FC<SimplePropsFormProps> = ({ schema, values, onChange }) => {
  const [localValues, setLocalValues] = useState(values);

  const handleChange = (name: string, value: any) => {
    const newValues = { ...localValues, [name]: value };
    setLocalValues(newValues);
  };

  const handleUpdate = () => {
    onChange(localValues);
  };

  return (
    <Stack spacing={2}>
      {schema.props.map((prop) => (
        <Paper key={prop.name} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" gutterBottom>
            {prop.label || prop.name}
          </Typography>

          {prop.type === 'string' && (
            <input
              type="text"
              value={localValues[prop.name] || ''}
              onChange={(e) => handleChange(prop.name, e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          )}

          {prop.type === 'number' && (
            <input
              type="number"
              value={localValues[prop.name] || 0}
              onChange={(e) => handleChange(prop.name, Number(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          )}

          {prop.type === 'boolean' && (
            <input
              type="checkbox"
              checked={!!localValues[prop.name]}
              onChange={(e) => handleChange(prop.name, e.target.checked)}
            />
          )}
        </Paper>
      ))}

      <Button variant="contained" onClick={handleUpdate}>
        Update Props
      </Button>
    </Stack>
  );
};
