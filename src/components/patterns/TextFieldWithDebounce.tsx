import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useDebounce } from '../../hooks/useDebounce';

interface TextFieldWithDebounceProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounceMs?: number;
}

export const TextFieldWithDebounce: React.FC<TextFieldWithDebounceProps> = ({
  value,
  onChange,
  debounceMs = 300,
  type,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Update local value when prop changes (e.g., reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Notify parent when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    setLocalValue(newValue);
  };

  return <TextField {...props} type={type} value={localValue} onChange={handleChange} />;
};
