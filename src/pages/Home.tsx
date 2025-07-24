import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  interface Feature {
    title: string;
    description: string;
    icon: React.ReactElement;
    action: () => void;
    color: string;
    disabled?: boolean;
  }

  const features: Feature[] = [
    {
      title: 'Component Showcase',
      description: 'Explore all MUI components organized by category with live examples and variants.',
      icon: <DashboardIcon fontSize="large" />,
      action: () => navigate('/components'),
      color: 'primary.main',
    },
    {
      title: 'Theme Viewer',
      description: 'View and copy all theme values including colors, typography, spacing, and more.',
      icon: <PaletteIcon fontSize="large" />,
      action: () => navigate('/theme'),
      color: 'secondary.main',
    },
    {
      title: 'Pattern Generator',
      description: 'Generate and manage reusable component patterns with MUI.',
      icon: <CodeIcon fontSize="large" />,
      action: () => navigate('/patterns'),
      color: 'success.main',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom 
          align="center"
        >
          MUI Pattern Generator
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          align="center" 
          paragraph
        >
          A comprehensive toolkit for Material-UI theme development and component exploration
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  cursor: feature.disabled ? 'default' : 'pointer',
                  '&:hover': feature.disabled ? {} : {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={feature.disabled ? undefined : feature.action}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="large"
                    disabled={feature.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      feature.action();
                    }}
                  >
                    {feature.disabled ? 'Coming Soon' : 'Explore'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 6, p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            This application showcases Material-UI (MUI) components with a custom theme implementation.
            Use the navigation menu to explore different sections:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>Component Showcase:</strong> View all MUI components organized by category
              (Inputs, Data Display, Feedback, Navigation, and Surfaces)
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Theme Viewer:</strong> Inspect theme values including color palettes,
              typography settings, spacing units, shadows, and breakpoints
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Pattern Generator:</strong> Create reusable component patterns using MUI components.
              Tell Claude to generate patterns via the terminal and manage them through the UI
            </Typography>
          </Box>
          <Typography variant="body1">
            The theme supports both light and dark modes. Use the toggle button in the app bar
            to switch between them.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};