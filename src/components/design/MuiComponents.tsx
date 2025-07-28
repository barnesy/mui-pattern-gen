import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  Alert,
  AlertTitle,
  Typography,
  Box,
} from '@mui/material';

/**
 * MUI Button wrapper for schema system
 */
export const MuiButtonComponent: React.FC<{
  label?: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}> = ({
  label = 'Button',
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

/**
 * MUI Card wrapper for schema system
 */
export const MuiCardComponent: React.FC<{
  title?: string;
  subtitle?: string;
  content?: string;
  elevation?: number;
  showActions?: boolean;
  showMedia?: boolean;
  mediaUrl?: string;
  mediaHeight?: number;
}> = ({
  title = 'Card Title',
  subtitle = '',
  content = 'Card content goes here',
  elevation = 1,
  showActions = true,
  showMedia = false,
  mediaUrl = '',
  mediaHeight = 140,
}) => {
  return (
    <Card elevation={elevation}>
      {showMedia && mediaUrl && (
        <CardMedia component="img" height={mediaHeight} image={mediaUrl} alt={title} />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
      {showActions && (
        <CardActions>
          <Button size="small">Share</Button>
          <Button size="small">Learn More</Button>
        </CardActions>
      )}
    </Card>
  );
};

/**
 * MUI TextField wrapper for schema system
 */
export const MuiTextFieldComponent: React.FC<{
  label?: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: boolean;
}> = ({
  label = 'Text Field',
  placeholder = '',
  helperText = '',
  defaultValue = '',
  variant = 'outlined',
  size = 'medium',
  required = false,
  disabled = false,
  fullWidth = true,
  multiline = false,
  rows = 4,
  error = false,
}) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      variant={variant}
      size={size}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      error={error}
    />
  );
};

/**
 * MUI Alert wrapper for schema system
 */
export const MuiAlertComponent: React.FC<{
  message?: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'standard' | 'outlined' | 'filled';
  closable?: boolean;
}> = ({
  message = 'This is an alert message',
  title = '',
  severity = 'info',
  variant = 'standard',
  closable = false,
}) => {
  const [open, setOpen] = React.useState(true);

  if (!open && closable) {
    return null;
  }

  return (
    <Alert
      severity={severity}
      variant={variant}
      onClose={closable ? () => setOpen(false) : undefined}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

/**
 * Register all MUI components
 */
export function registerMuiComponents(registry: Map<string, React.ComponentType<any>>) {
  registry.set('MuiButton', MuiButtonComponent);
  registry.set('MuiCard', MuiCardComponent);
  registry.set('MuiTextField', MuiTextFieldComponent);
  registry.set('MuiAlert', MuiAlertComponent);
}
