import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Alert,
  useTheme,
} from '@mui/material';

export const BorderRadiusTest: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Border Radius Test
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Theme borderRadius: {theme.shape.borderRadius}px
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>Button (base: {theme.shape.borderRadius}px)</Typography>
          <Button variant="contained">Test Button</Button>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Paper (2× base: {theme.shape.borderRadius * 2}px)</Typography>
          <Paper sx={{ p: 2 }}>
            <Typography>Test Paper</Typography>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Card (3× base: {theme.shape.borderRadius * 3}px)</Typography>
          <Card>
            <CardContent>
              <Typography>Test Card</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>TextField (base: {theme.shape.borderRadius}px)</Typography>
          <TextField label="Test Input" variant="outlined" />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Chip (4× base: {theme.shape.borderRadius * 4}px)</Typography>
          <Chip label="Test Chip" />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Alert (2× base: {theme.shape.borderRadius * 2}px)</Typography>
          <Alert severity="info">Test Alert</Alert>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Computed Styles Inspector
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
              {`Theme shape.borderRadius: ${theme.shape.borderRadius}
Button: ${theme.shape.borderRadius}px
Paper: ${theme.shape.borderRadius * 2}px
Card: ${theme.shape.borderRadius * 3}px
Chip: ${theme.shape.borderRadius * 4}px`}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};