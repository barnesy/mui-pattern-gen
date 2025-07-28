import React from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '8px 12px',
  fontSize: '0.875rem',
  lineHeight: '1.5',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'}`,
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  fontFamily: theme.typography.fontFamily,
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:focus': {
    outline: 0,
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  '&.error': {
    borderColor: theme.palette.error.main,
    '&:focus': {
      borderColor: theme.palette.error.main,
      boxShadow: `0 0 0 1px ${theme.palette.error.main}`,
    },
  },
  '&:disabled': {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.action.disabledBackground,
    cursor: 'not-allowed',
  },
}));

export interface SimpleInputProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
}

export const SimpleInput: React.FC<SimpleInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  error = false,
  helperText,
  disabled = false,
  placeholder,
  fullWidth = true,
}) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <Typography variant="body2" color={error ? 'error' : 'text.secondary'} sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <StyledInput
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? 'error' : ''}
      />
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </Box>
  );
};
