import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { PaletteOptions } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';

interface ThemePreviewProps {
  themeState: {
    palette: PaletteOptions;
    darkPalette: PaletteOptions;
    typography: TypographyOptions;
    spacing: number;
    borderRadius: number;
  };
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ themeState }) => {
  const [darkMode, setDarkMode] = React.useState(false);

  // Create a preview theme based on the current state
  const previewTheme = React.useMemo(() => {
    const paletteToUse = darkMode ? themeState.darkPalette : themeState.palette;
    
    return createTheme({
      palette: paletteToUse,
      typography: themeState.typography,
      spacing: themeState.spacing,
      shape: {
        borderRadius: themeState.borderRadius,
      },
    });
  }, [themeState, darkMode]);

  return (
    <ThemeProvider theme={previewTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
        <Box sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
            label="Preview Dark Mode"
          />
        </Box>

        {/* Typography Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', mb: 2, borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', pb: 1 }}>
            Typography
          </Typography>
          <Stack spacing={1}>
            <Typography variant="h1">H1 Heading</Typography>
            <Typography variant="h2">H2 Heading</Typography>
            <Typography variant="h3">H3 Heading</Typography>
            <Typography variant="h4">H4 Heading</Typography>
            <Typography variant="h5">H5 Heading</Typography>
            <Typography variant="h6">H6 Heading</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1">
              Body 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
            <Typography variant="body2">
              Body 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
            <Typography variant="subtitle1">Subtitle 1</Typography>
            <Typography variant="subtitle2">Subtitle 2</Typography>
            <Typography variant="button" display="block">Button Text</Typography>
            <Typography variant="caption" display="block">
              Caption text
            </Typography>
            <Typography variant="overline" display="block">
              Overline text
            </Typography>
          </Stack>
        </Box>

        {/* Color Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', mb: 2, borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Colors</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="contained" color="secondary">Secondary</Button>
              <Button variant="contained" color="error">Error</Button>
              <Button variant="contained" color="warning">Warning</Button>
              <Button variant="contained" color="info">Info</Button>
              <Button variant="contained" color="success">Success</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button variant="outlined" color="primary">Primary</Button>
              <Button variant="outlined" color="secondary">Secondary</Button>
              <Button variant="outlined" color="error">Error</Button>
              <Button variant="outlined" color="warning">Warning</Button>
              <Button variant="outlined" color="info">Info</Button>
              <Button variant="outlined" color="success">Success</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Error" color="error" />
              <Chip label="Warning" color="warning" />
              <Chip label="Info" color="info" />
              <Chip label="Success" color="success" />
            </Box>
          </Stack>
        </Box>

        {/* Background & Text Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', mb: 2, borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Background & Text Colors</Typography>
          <Stack spacing={2}>
            <Box sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
              <Typography color="text.primary">Primary text on default background</Typography>
              <Typography color="text.secondary">Secondary text on default background</Typography>
              <Typography color="text.disabled">Disabled text on default background</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
              <Typography color="text.primary">Primary text on paper background</Typography>
              <Typography color="text.secondary">Secondary text on paper background</Typography>
              <Typography color="text.disabled">Disabled text on paper background</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography gutterBottom>Divider Examples:</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Standard Divider</Typography>
              <Divider sx={{ my: 1 }} textAlign="center">
                <Chip label="OR" size="small" />
              </Divider>
              <Typography variant="body2">Divider with Chip</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Components Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', mb: 2, borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Components</Typography>
          <Stack spacing={2}>
            <TextField
              label="Text Field"
              placeholder="Enter text"
              fullWidth
              variant="outlined"
            />
            <Alert severity="info">This is an info alert — check it out!</Alert>
            <Alert severity="success">This is a success alert — check it out!</Alert>
            <Alert severity="warning">This is a warning alert — check it out!</Alert>
            <Alert severity="error">This is an error alert — check it out!</Alert>
          </Stack>
        </Box>

        {/* Card Preview */}
        <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Card Component
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This card demonstrates the border radius and elevation settings.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton color="primary">
                <EditIcon />
              </IconButton>
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
              <IconButton color="success">
                <AddIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>

        {/* Spacing Preview */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Spacing</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              Padding 1
            </Box>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              Padding 2
            </Box>
            <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              Padding 3
            </Box>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Base unit: {themeState.spacing}px
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};