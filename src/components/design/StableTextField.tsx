import React, { useState, useEffect, useRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * Stable TextField that prevents infinite loops
 */
export const StableTextField: React.FC<TextFieldProps> = (props) => {
  const { value: propValue, onChange, ...restProps } = props;
  const [internalValue, setInternalValue] = useState(propValue || '');
  const isInternalChangeRef = useRef(false);

  // Sync with external value changes
  useEffect(() => {
    if (!isInternalChangeRef.current) {
      setInternalValue(propValue || '');
    }
    isInternalChangeRef.current = false;
  }, [propValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    isInternalChangeRef.current = true;
    setInternalValue(newValue);
    if (onChange) {
      // Create a new event to avoid Material-UI's internal state issues
      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: newValue,
        },
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <TextField
      {...restProps}
      value={internalValue}
      onChange={handleChange}
      // Prevent Material-UI's internal autofill detection which can cause loops
      inputProps={{
        ...restProps.inputProps,
        autoComplete: 'off',
      }}
    />
  );
};
