import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';

export interface SizeValue {
  mode: 'auto' | '100%' | 'custom';
  customValue?: number;
  unit?: 'px' | '%';
}

interface SizeControlProps {
  label: string;
  value: SizeValue;
  onChange: (value: SizeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
}

export const SizeControl: React.FC<SizeControlProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
  helperText,
}) => {
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode && newMode !== value.mode) {
      onChange({
        mode: newMode as 'auto' | '100%' | 'custom',
        customValue: value.customValue || 300,
        unit: value.unit || 'px',
      });
    }
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange({
      ...value,
      mode: 'custom',
      customValue: newValue as number,
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      onChange({
        ...value,
        mode: 'custom',
        customValue: Math.max(min, Math.min(max, newValue)),
      });
    }
  };

  const displayValue = value.mode === 'custom' 
    ? `${value.customValue}${value.unit || 'px'}`
    : value.mode;

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        {label}: <strong>{displayValue}</strong>
      </Typography>
      
      <Stack spacing={2}>
        <ToggleButtonGroup
          value={value.mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          fullWidth
        >
          <ToggleButton value="auto">Auto</ToggleButton>
          <ToggleButton value="100%">100%</ToggleButton>
          <ToggleButton value="custom">Custom</ToggleButton>
        </ToggleButtonGroup>

        {value.mode === 'custom' && (
          <>
            <Slider
              value={value.customValue || 300}
              onChange={handleSliderChange}
              min={min}
              max={max}
              step={step}
              valueLabelDisplay="auto"
              marks={[
                { value: min, label: `${min}` },
                { value: max, label: `${max}` },
              ]}
            />
            <TextField
              type="number"
              size="small"
              value={value.customValue || 300}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">{value.unit || 'px'}</InputAdornment>,
              }}
              inputProps={{
                min,
                max,
                step,
              }}
            />
          </>
        )}
      </Stack>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};