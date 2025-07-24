import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { PaletteOptions } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { ColorPaletteEditor } from '../components/ThemeEditor/ColorPaletteEditor';
import { ThemePreview } from '../components/ThemeEditor/ThemePreview';
import { palette as lightPalette } from '../theme/palette';
import { darkPalette } from '../theme/darkPalette';
import { typography } from '../theme/typography';
import { generateThemeFiles } from '../utils/themeFileWriter';

interface ThemeEditorState {
  palette: PaletteOptions;
  darkPalette: PaletteOptions;
  typography: TypographyOptions;
  spacing: number;
  borderRadius: number;
}

export const ThemeEditor: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('colors');
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [themeState, setThemeState] = useState<ThemeEditorState>({
    palette: JSON.parse(JSON.stringify(lightPalette)),
    darkPalette: JSON.parse(JSON.stringify(darkPalette)),
    typography: JSON.parse(JSON.stringify(typography)),
    spacing: 8,
    borderRadius: 4,
  });

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleColorChange = (section: string, color: string, value: string, isDark: boolean = false) => {
    const paletteKey = isDark ? 'darkPalette' : 'palette';
    
    // Handle special case for divider which is a direct property
    if (section === 'divider') {
      setThemeState(prev => ({
        ...prev,
        [paletteKey]: {
          ...prev[paletteKey],
          divider: value,
        },
      }));
    } else {
      setThemeState(prev => ({
        ...prev,
        [paletteKey]: {
          ...prev[paletteKey],
          [section]: {
            ...(prev[paletteKey] as Record<string, any>)[section],
            [color]: value,
          },
        },
      }));
    }
  };

  const handleTypographyChange = (variant: string, property: string, value: string | number) => {
    setThemeState(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [variant]: {
          ...(prev.typography as Record<string, any>)[variant],
          [property]: value,
        },
      },
    }));
  };

  const handleSpacingChange = (value: number) => {
    setThemeState(prev => ({ ...prev, spacing: value }));
  };

  const handleBorderRadiusChange = (value: number) => {
    setThemeState(prev => ({ ...prev, borderRadius: value }));
  };

  const handleReset = () => {
    setThemeState({
      palette: JSON.parse(JSON.stringify(lightPalette)),
      darkPalette: JSON.parse(JSON.stringify(darkPalette)),
      typography: JSON.parse(JSON.stringify(typography)),
      spacing: 8,
      borderRadius: 4,
    });
    setSnackbar({ open: true, message: 'Theme reset to current values', severity: 'success' });
  };

  const handleSave = async () => {
    try {
      const files = generateThemeFiles(themeState);
      
      // Send the files to our development API
      const response = await fetch('/api/update-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(files),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Theme files saved successfully! The page will reload to apply changes.',
          severity: 'success',
        });
        
        // Reload after a short delay to show the message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to save theme files');
      }
    } catch (error) {
      // Log error for debugging in development
      if (import.meta.env.DEV) {
        console.error('Save error:', error);
      }
      
      // Fallback: show the files in dialog for manual copying
      setCodeDialogOpen(true);
      
      setSnackbar({
        open: true,
        message: 'Failed to save automatically. Please copy the files manually from the dialog.',
        severity: 'error',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Code copied to clipboard!',
      severity: 'success',
    });
  };

  const typographyVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h1">Theme Editor</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Theme
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Editor Panel */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2 }}>
            {/* Colors Section */}
            <Accordion expanded={expanded === 'colors'} onChange={handleAccordionChange('colors')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Colors</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Light Mode</Typography>
                  <ColorPaletteEditor
                    palette={themeState.palette}
                    isDarkMode={false}
                    onColorChange={handleColorChange}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" gutterBottom>Dark Mode</Typography>
                  <ColorPaletteEditor
                    palette={themeState.darkPalette}
                    isDarkMode={true}
                    onColorChange={handleColorChange}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Typography Section */}
            <Accordion expanded={expanded === 'typography'} onChange={handleAccordionChange('typography')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Typography</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {typographyVariants.map((variant) => (
                    <Paper key={variant} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {variant}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Font Size"
                            value={(themeState.typography as Record<string, any>)[variant]?.fontSize || ''}
                            onChange={(e) => handleTypographyChange(variant, 'fontSize', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Font Weight"
                            value={(themeState.typography as Record<string, any>)[variant]?.fontWeight || ''}
                            onChange={(e) => handleTypographyChange(variant, 'fontWeight', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Line Height"
                            value={(themeState.typography as Record<string, any>)[variant]?.lineHeight || ''}
                            onChange={(e) => handleTypographyChange(variant, 'lineHeight', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField
                            label="Letter Spacing"
                            value={(themeState.typography as Record<string, any>)[variant]?.letterSpacing || ''}
                            onChange={(e) => handleTypographyChange(variant, 'letterSpacing', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Spacing & Shape Section */}
            <Accordion expanded={expanded === 'spacing'} onChange={handleAccordionChange('spacing')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Spacing & Shape</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <TextField
                    label="Base Spacing Unit (px)"
                    type="number"
                    value={themeState.spacing}
                    onChange={(e) => handleSpacingChange(Number(e.target.value))}
                    helperText="Default: 8px. Used for margin and padding calculations."
                    fullWidth
                  />
                  <TextField
                    label="Border Radius (px)"
                    type="number"
                    value={themeState.borderRadius}
                    onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
                    helperText="Default: 4px. Applied to buttons, cards, and other components."
                    fullWidth
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Live Preview</Typography>
              <ThemePreview themeState={themeState} />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Code Dialog */}
      <Dialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Generated Theme Files
        </DialogTitle>
        <DialogContent>
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
            <Tab label="palette.ts" />
            <Tab label="darkPalette.ts" />
            <Tab label="typography.ts" />
            <Tab label="theme.ts" />
          </Tabs>

          {currentTab === 0 && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">src/theme/palette.ts</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(generateThemeFiles(themeState).palette)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography component="pre" variant="body2" sx={{ overflow: 'auto', m: 0, fontFamily: 'monospace' }}>
                {generateThemeFiles(themeState).palette}
              </Typography>
            </Paper>
          )}

          {currentTab === 1 && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">src/theme/darkPalette.ts</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(generateThemeFiles(themeState).darkPalette)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography component="pre" variant="body2" sx={{ overflow: 'auto', m: 0, fontFamily: 'monospace' }}>
                {generateThemeFiles(themeState).darkPalette}
              </Typography>
            </Paper>
          )}

          {currentTab === 2 && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">src/theme/typography.ts</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(generateThemeFiles(themeState).typography)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography component="pre" variant="body2" sx={{ overflow: 'auto', m: 0, fontFamily: 'monospace' }}>
                {generateThemeFiles(themeState).typography}
              </Typography>
            </Paper>
          )}

          {currentTab === 3 && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">src/theme/theme.ts</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(generateThemeFiles(themeState).theme)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography component="pre" variant="body2" sx={{ overflow: 'auto', m: 0, fontFamily: 'monospace' }}>
                {generateThemeFiles(themeState).theme}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};