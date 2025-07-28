import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Stack,
  Alert,
  Drawer,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { SchemaComponent, DesignPanel, useDesignStore } from '../components/design';
import { registerComponent, componentRegistry } from '../schemas/registry';

// Simple test component
const TestComponent: React.FC<{ title?: string; value?: number }> = ({
  title = 'Test Component',
  value = 0,
}) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography>Value: {value}</Typography>
  </Paper>
);

// Register test component
registerComponent('TestComponent', TestComponent);

/**
 * Demo page showcasing the new schema-first design system
 */
export const DesignSystemDemo: React.FC = () => {
  const { instances, selectedId, registerSchema, createInstance, selectInstance } =
    useDesignStore();

  // Register schemas on mount
  useEffect(() => {
    // Get the store actions directly to avoid dependency issues
    const store = useDesignStore.getState();

    // Register test schema
    store.registerSchema({
      id: 'TestComponent',
      name: 'Test Component',
      type: 'display',
      props: [
        {
          name: 'title',
          type: 'string',
          label: 'Title',
          default: 'Test Component',
        },
        {
          name: 'value',
          type: 'number',
          label: 'Value',
          default: 0,
        },
      ],
    });
  }, []); // Empty dependency array - only run once on mount

  // Create demo instance
  const handleCreateComponent = () => {
    const id = createInstance('TestComponent', {
      title: 'My Test Component',
      value: 42,
    });
    // Don't auto-select to avoid potential infinite loop
    console.log('Created instance:', id);
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Schema-First Design System
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          This demo shows the new unified design system. All components are schema-based, with a
          single store and clean architecture.
        </Alert>

        <Grid container spacing={3}>
          {/* Component palette */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Add Components
              </Typography>

              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleCreateComponent}
                >
                  Add Test Component
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Canvas */}
          <Grid item xs={12} md={9}>
            <Paper
              sx={{
                p: 3,
                minHeight: 600,
                bgcolor: 'grey.50',
                position: 'relative',
              }}
            >
              {Array.from(instances.values()).length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">Click a button to add components</Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {Array.from(instances.values()).map((instance) => (
                    <Box key={instance.id}>
                      <SchemaComponent instanceId={instance.id} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Component info */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Design Store State
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Registered Components
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Array.from(componentRegistry.keys()).map((key) => (
                  <Typography
                    key={key}
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor: 'primary.light',
                      borderRadius: 1,
                    }}
                  >
                    {key}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Component Instances
              </Typography>
              <Typography variant="body2">
                {instances.size} instance{instances.size !== 1 ? 's' : ''} created
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Design panel drawer */}
      <Drawer
        anchor="right"
        open={!!selectedId}
        onClose={() => selectInstance(null)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <DesignPanel onClose={() => selectInstance(null)} />
      </Drawer>
    </Container>
  );
};
