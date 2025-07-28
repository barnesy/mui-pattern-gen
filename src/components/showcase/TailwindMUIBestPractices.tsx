import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';

export const TailwindMUIBestPractices: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MUI Styling Best Practices
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Best practices for styling with Material-UI's theme system.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          MUI provides a complete styling solution with the sx prop, styled components, and theme
          customization.
        </Typography>
      </Alert>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Do's and Don'ts */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Best Practices
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CheckIcon /> Do's
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use sx prop for one-off styles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quick styling without creating new components
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button variant="contained" size="small">
                    Button 1
                  </Button>
                  <Button variant="outlined" size="small">
                    Button 2
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use Theme Breakpoints
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Responsive design with theme.breakpoints
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>Card 1</CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>Card 2</CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use Theme Values
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consistent spacing, colors, and typography
                </Typography>
                <Button variant="contained" sx={{ mt: 1 }}>
                  Themed Button
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <CancelIcon /> Don'ts
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Use Inline Styles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avoid style prop, use sx instead
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ mt: 1, fontFamily: 'monospace' }}
                >
                  ❌ style=&#123;&#123; color: 'blue' &#125;&#125;
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Hard-code Values
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use theme values for consistency
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ mt: 1, fontFamily: 'monospace' }}
                >
                  ❌ sx=&#123;&#123; margin: '16px' &#125;&#125;
                  <br />✅ sx=&#123;&#123; m: 2 &#125;&#125;
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Mix Styling Systems
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stick to MUI's styling approach
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ mt: 1, fontFamily: 'monospace' }}
                >
                  ✅ Use sx, styled(), or theme
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Good Examples */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Recommended Usage Examples
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Layout with MUI
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Flexbox Layout</Typography>
                <Button variant="outlined" size="small">
                  Action
                </Button>
              </Box>
              <Grid container spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Grid item xs={4} key={i}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2">Item {i}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Transitions with MUI
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Hover Scale Effect
              </Button>
              <Card className="animate-fade-in">
                <CardContent>
                  <Typography>Fade In Animation</Typography>
                </CardContent>
              </Card>
            </Stack>
          </Paper>
        </Grid>

        {/* Theme Example */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              MUI Theme Configuration
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem',
                p: 2,
                bgcolor: 'grey.900',
                color: 'grey.50',
                borderRadius: 1,
                overflow: 'auto',
              }}
            >
              {`// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  spacing: 8, // 8px * factor
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
