// Theme File Writer Utility
// TODO: In a production environment, this should be replaced with a proper API endpoint
// that writes to the filesystem. Current implementation generates file contents for manual copying.

import { PaletteOptions } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { logger } from '../services/logger';

export interface ThemeFiles {
  palette: string;
  darkPalette: string;
  typography: string;
  theme: string;
}

interface ThemeState {
  palette: PaletteOptions;
  darkPalette: PaletteOptions;
  typography: TypographyOptions;
  spacing: number;
  borderRadius: number;
}

export const generateThemeFiles = (themeState: ThemeState): ThemeFiles => {
  // Generate palette.ts content
  const paletteContent = `import { PaletteOptions } from '@mui/material/styles';

export const palette: PaletteOptions = ${JSON.stringify(themeState.palette, null, 2)};`;

  // Generate darkPalette.ts content
  const darkPaletteContent = `import { PaletteOptions } from '@mui/material/styles';

export const darkPalette: PaletteOptions = ${JSON.stringify(themeState.darkPalette, null, 2)};`;

  // Generate typography.ts content
  const typographyContent = `import { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = ${JSON.stringify(themeState.typography, null, 2)};`;

  // Generate theme.ts content
  const themeContent = `import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

export const theme = createTheme({
  palette,
  typography,
  components,
  spacing: ${themeState.spacing},
  shape: {
    borderRadius: ${themeState.borderRadius},
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});`;

  return {
    palette: paletteContent,
    darkPalette: darkPaletteContent,
    typography: typographyContent,
    theme: themeContent,
  };
};

// Helper function to display generated files in console for manual copying
// Note: This function is for development/debugging purposes only
export const logThemeFiles = (files: ThemeFiles): void => {
  logger.info('=== COPY THESE FILES TO YOUR THEME DIRECTORY ===', 'ThemeFileWriter');

  logger.info('=== src/theme/palette.ts ===', 'ThemeFileWriter');
  logger.info(files.palette, 'ThemeFileWriter');

  logger.info('=== src/theme/darkPalette.ts ===', 'ThemeFileWriter');
  logger.info(files.darkPalette, 'ThemeFileWriter');

  logger.info('=== src/theme/typography.ts ===', 'ThemeFileWriter');
  logger.info(files.typography, 'ThemeFileWriter');

  logger.info('=== src/theme/theme.ts ===', 'ThemeFileWriter');
  logger.info(files.theme, 'ThemeFileWriter');

  logger.info('=== END OF FILES ===', 'ThemeFileWriter');
};
