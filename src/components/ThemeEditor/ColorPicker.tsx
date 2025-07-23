import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Popover,
  Stack,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: value,
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: 0.5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = value;
                  input.onchange = (e: Event) => {
                    onChange((e.target as HTMLInputElement).value);
                  };
                  input.click();
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" onClick={handleClick} size="small">
                <PaletteIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5 }}>
              {/* Material Design Colors */}
              {[
                '#F44336', '#E91E63', '#9C27B0', '#673AB7',
                '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
                '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
                '#795548', '#9E9E9E', '#607D8B', '#000000',
                '#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD',
                '#9E9E9E', '#757575', '#616161', '#424242',
                '#212121', '#4B3FFF', '#F86A0B', '#3AAB68',
                '#ED4B48', '#DCE6F4', '#31414E', '#FAFAFA',
              ].map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: color,
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => {
                    onChange(color);
                    handleClose();
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};