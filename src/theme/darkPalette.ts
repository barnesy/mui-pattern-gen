import { PaletteOptions } from '@mui/material/styles';

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    light: '#9B8FFF',
    main: '#7B6FFF',
    dark: '#4B3FFF',
    contrastText: '#000',
  },
  secondary: {
    light: '#FBAB5D',
    main: '#FA8B3D',
    dark: '#F86A0B',
    contrastText: '#000',
  },
  error: {
    light: '#F39A97',
    main: '#F17A77',
    dark: '#ED4B48',
    contrastText: '#fff',
  },
  warning: {
    light: '#FBAB5D',
    main: '#FA8B3D',
    dark: '#F86A0B',
    contrastText: '#000',
  },
  info: {
    light: '#F0F5FC',
    main: '#E7EEFB',
    dark: '#DCE6F4',
    contrastText: '#31414E',
  },
  success: {
    light: '#87D9B0',
    main: '#67C990',
    dark: '#3AAB68',
    contrastText: '#000',
  },
  grey: {
    '50': '#FAFAFA',
    '100': '#F5F5F5',
    '200': '#EEEEEE',
    '300': '#E0E0E0',
    '400': '#BDBDBD',
    '500': '#9E9E9E',
    '600': '#757575',
    '700': '#616161',
    '800': '#424242',
    '900': '#212121',
  },
  background: {
    default: '#1A1F25',
    paper: '#181f25',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};
