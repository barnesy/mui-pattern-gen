import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { PaletteOptions } from '@mui/material/styles';
import { ColorPicker } from './ColorPicker';

interface ColorPaletteEditorProps {
  palette: PaletteOptions;
  isDarkMode?: boolean;
  onColorChange: (colorKey: string, variant: string, value: string, isDarkMode?: boolean) => void;
}

const COLOR_KEYS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
const COLOR_VARIANTS = ['light', 'main', 'dark', 'contrastText'] as const;

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  palette,
  isDarkMode = false,
  onColorChange,
}) => {
  return (
    <Grid container spacing={2}>
      {/* Theme Colors */}
      {COLOR_KEYS.map((colorKey) => (
        <Grid item xs={12} md={6} key={`${isDarkMode ? 'dark-' : ''}${colorKey}`}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {colorKey}
            </Typography>
            <Stack spacing={1}>
              {COLOR_VARIANTS.map((variant) => (
                <ColorPicker
                  key={variant}
                  label={variant === 'contrastText' ? 'Contrast' : variant.charAt(0).toUpperCase() + variant.slice(1)}
                  value={(palette[colorKey] as Record<string, string>)?.[variant] || (variant === 'contrastText' ? '#ffffff' : '#000000')}
                  onChange={(value) => onColorChange(colorKey, variant, value, isDarkMode)}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      ))}

      {/* Background Colors */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Background
          </Typography>
          <Stack spacing={1}>
            <ColorPicker
              label="Default"
              value={palette.background?.default || (isDarkMode ? '#1A1F25' : '#FFFFFF')}
              onChange={(value) => onColorChange('background', 'default', value, isDarkMode)}
            />
            <ColorPicker
              label="Paper"
              value={palette.background?.paper || (isDarkMode ? '#31414E' : '#F5F5F5')}
              onChange={(value) => onColorChange('background', 'paper', value, isDarkMode)}
            />
          </Stack>
        </Paper>
      </Grid>

      {/* Text Colors */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Text
          </Typography>
          <Stack spacing={1}>
            <ColorPicker
              label="Primary"
              value={palette.text?.primary || (isDarkMode ? '#FFFFFF' : 'rgba(0, 0, 0, 0.87)')}
              onChange={(value) => onColorChange('text', 'primary', value, isDarkMode)}
            />
            <ColorPicker
              label="Secondary"
              value={palette.text?.secondary || (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)')}
              onChange={(value) => onColorChange('text', 'secondary', value, isDarkMode)}
            />
            <ColorPicker
              label="Disabled"
              value={palette.text?.disabled || (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)')}
              onChange={(value) => onColorChange('text', 'disabled', value, isDarkMode)}
            />
          </Stack>
        </Paper>
      </Grid>

      {/* Other Colors */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Other
          </Typography>
          <Stack spacing={1}>
            <ColorPicker
              label="Divider"
              value={palette.divider || (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)')}
              onChange={(value) => onColorChange('divider', '', value, isDarkMode)}
            />
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};