import { PaletteOptions } from '@mui/material/styles';

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    light: '#90caf9',
    main: '#42a5f5',
    dark: '#1e88e5',
    contrastText: '#000',
  },
  secondary: {
    light: '#f48fb1',
    main: '#f06292',
    dark: '#e91e63',
    contrastText: '#000',
  },
  error: {
    light: '#ef5350',
    main: '#f44336',
    dark: '#c62828',
    contrastText: '#fff',
  },
  warning: {
    light: '#ff9800',
    main: '#ffa726',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    light: '#4fc3f7',
    main: '#29b6f6',
    dark: '#0288d1',
    contrastText: '#000',
  },
  success: {
    light: '#66bb6a',
    main: '#4caf50',
    dark: '#2e7d32',
    contrastText: '#000',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};