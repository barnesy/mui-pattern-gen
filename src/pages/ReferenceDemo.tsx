import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stack,
  Alert,
  Grid,
} from '@mui/material';

export const ReferenceDemo: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Component Reference Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Enable AI Design Mode and click on any component below to see its unique reference ID
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Button Examples
            </Typography>
            <Stack spacing={2}>
              <Button variant="contained" color="primary">
                Primary Button
              </Button>
              <Button variant="outlined" color="secondary">
                Secondary Button
              </Button>
              <Button variant="text" size="small">
                Small Text Button
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nested Components
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Stack spacing={2}>
                <Button variant="contained" fullWidth>
                  Full Width Button
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">
                    Option 1
                  </Button>
                  <Button variant="outlined" size="small">
                    Option 2
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};