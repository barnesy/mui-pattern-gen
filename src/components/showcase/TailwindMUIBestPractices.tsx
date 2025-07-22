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
import { 
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

export const TailwindMUIBestPractices: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tailwind + MUI Best Practices
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Using Tailwind CSS to complement MUI's theming system without conflicts.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Tailwind is configured to work alongside MUI without overriding theme values like border radius, colors, or shadows.
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
            <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon /> Do's
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use Tailwind for Layout
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Flexbox, Grid, spacing utilities
                </Typography>
                <Box className="flex gap-4 mt-2">
                  <Button variant="contained" size="small">Button 1</Button>
                  <Button variant="outlined" size="small">Button 2</Button>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use Tailwind for Responsive Design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Responsive modifiers like sm:, md:, lg:
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <Card><CardContent>Card 1</CardContent></Card>
                  <Card><CardContent>Card 2</CardContent></Card>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Use MUI Theme for Component Styling
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Let MUI handle colors, shadows, border radius
                </Typography>
                <Button variant="contained" sx={{ mt: 1 }}>
                  MUI Themed Button
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelIcon /> Don'ts
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Override MUI Styles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avoid changing colors, shadows, or radii with Tailwind
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1, fontFamily: 'monospace' }}>
                  ❌ className="rounded-lg shadow-xl bg-blue-500"
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Mix Styling Approaches
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use either sx prop or theme for component styling
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1, fontFamily: 'monospace' }}>
                  ❌ sx=&#123;&#123; color: 'primary.main' &#125;&#125; className="text-blue-500"
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Don't Use Conflicting Resets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep Tailwind's preflight disabled
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1, fontFamily: 'monospace' }}>
                  ✅ corePlugins: &#123; preflight: false &#125;
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
              Layout with Tailwind
            </Typography>
            <Box className="space-y-4">
              <Box className="flex justify-between items-center">
                <Typography variant="body1">Flexbox Layout</Typography>
                <Button variant="outlined" size="small">Action</Button>
              </Box>
              <Box className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent>
                      <Typography variant="body2">Item {i}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Animations with Tailwind
            </Typography>
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                className="transition-transform hover:scale-105"
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

        {/* Configuration Example */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Proper Configuration
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              fontFamily: 'monospace', 
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem',
              p: 2,
              bgcolor: 'grey.900',
              color: 'grey.50',
              borderRadius: 1,
              overflow: 'auto'
            }}>
{`// tailwind.config.js
export default {
  corePlugins: {
    preflight: false, // Don't reset MUI styles
  },
  important: false,   // Let MUI win specificity battles
  
  theme: {
    extend: {
      // Only add custom utilities, don't override
    }
  }
}`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};