import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

export const ThemeViewer: React.FC = () => {
  const theme = useTheme();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderColorSwatch = (color: string, label: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: color,
          borderRadius: 1,
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {color}
        </Typography>
      </Box>
      <Tooltip title="Copy color">
        <IconButton size="small" onClick={() => copyToClipboard(color)}>
          <CopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const spacingValues = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Theme Viewer
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Color Palette */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Color Palette
          </Typography>
        </Grid>

        {/* Primary Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Primary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.primary.light, 'Light')}
              {renderColorSwatch(theme.palette.primary.main, 'Main')}
              {renderColorSwatch(theme.palette.primary.dark, 'Dark')}
              {renderColorSwatch(theme.palette.primary.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Secondary Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Secondary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.secondary.light, 'Light')}
              {renderColorSwatch(theme.palette.secondary.main, 'Main')}
              {renderColorSwatch(theme.palette.secondary.dark, 'Dark')}
              {renderColorSwatch(theme.palette.secondary.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Error Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Error
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.error.light, 'Light')}
              {renderColorSwatch(theme.palette.error.main, 'Main')}
              {renderColorSwatch(theme.palette.error.dark, 'Dark')}
              {renderColorSwatch(theme.palette.error.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Warning Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Warning
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.warning.light, 'Light')}
              {renderColorSwatch(theme.palette.warning.main, 'Main')}
              {renderColorSwatch(theme.palette.warning.dark, 'Dark')}
              {renderColorSwatch(theme.palette.warning.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Info Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.info.light, 'Light')}
              {renderColorSwatch(theme.palette.info.main, 'Main')}
              {renderColorSwatch(theme.palette.info.dark, 'Dark')}
              {renderColorSwatch(theme.palette.info.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Success Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Success
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.success.light, 'Light')}
              {renderColorSwatch(theme.palette.success.main, 'Main')}
              {renderColorSwatch(theme.palette.success.dark, 'Dark')}
              {renderColorSwatch(theme.palette.success.contrastText, 'Contrast Text')}
            </Box>
          </Paper>
        </Grid>

        {/* Grey Colors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Grey Scale
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(theme.palette.grey).map(([key, value]) => (
                <Grid item xs={6} key={key}>
                  {renderColorSwatch(value, `Grey ${key}`)}
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Background & Text Colors */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Background
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.background.default, 'Default')}
              {renderColorSwatch(theme.palette.background.paper, 'Paper')}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Text
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderColorSwatch(theme.palette.text.primary, 'Primary')}
              {renderColorSwatch(theme.palette.text.secondary, 'Secondary')}
              {renderColorSwatch(theme.palette.text.disabled, 'Disabled')}
              {renderColorSwatch(theme.palette.divider, 'Divider')}
            </Box>
          </Paper>
        </Grid>

        {/* Typography */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Typography
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Variant</TableCell>
                    <TableCell>Font Size</TableCell>
                    <TableCell>Font Weight</TableCell>
                    <TableCell>Line Height</TableCell>
                    <TableCell>Letter Spacing</TableCell>
                    <TableCell>Example</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(theme.typography).map(([variant, styles]) => {
                    if (typeof styles !== 'object' || !('fontSize' in styles)) return null;
                    return (
                      <TableRow key={variant}>
                        <TableCell>{variant}</TableCell>
                        <TableCell>{styles.fontSize}</TableCell>
                        <TableCell>{styles.fontWeight}</TableCell>
                        <TableCell>{styles.lineHeight}</TableCell>
                        <TableCell>{styles.letterSpacing}</TableCell>
                        <TableCell>
                          <Typography variant={variant as any}>
                            The quick brown fox
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Spacing */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Spacing
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Base spacing unit: {theme.spacing(1)}px
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {spacingValues.map((value) => (
                <Box key={value} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'primary.main',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.contrastText',
                    }}
                  >
                    {value}
                  </Box>
                  <Typography variant="caption">
                    {theme.spacing(value)}px
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Shadows */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Shadows
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[0, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((elevation) => (
                <Grid item xs={6} sm={4} md={3} key={elevation}>
                  <Paper
                    elevation={elevation}
                    sx={{
                      p: 2,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography>Elevation {elevation}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Breakpoints */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Breakpoints
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Breakpoint</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>CSS Media Query</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(theme.breakpoints.values).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Chip label={key} size="small" />
                      </TableCell>
                      <TableCell>{value}px</TableCell>
                      <TableCell>
                        <code>@media (min-width: {value}px)</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Shape */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Shape
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Border Radius
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'primary.main',
                  borderRadius: `${theme.shape.borderRadius}px`,
                }}
              />
              <Typography>
                Default: {theme.shape.borderRadius}px
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};