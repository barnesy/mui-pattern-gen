import React, { useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, Stack, Alert, Snackbar } from '@mui/material';
import { Add, Dashboard } from '@mui/icons-material';
import { DesignSystemProvider, useDesignSystem } from '../contexts/DesignSystemContext';
import { PureSchemaComponent } from '../components/design/PureSchemaComponent';
import { PurePropsForm } from '../components/design/PurePropsForm';
import { ComponentPalette } from '../components/design/ComponentPalette';
import { ResponsiveCanvas } from '../components/design/ResponsiveCanvas';
import { PatternLoader } from '../components/design/PatternLoader';
import { componentRegistry } from '../schemas/registry';
import { muiComponentSchemas } from '../schemas/patternSchemas';
import { registerMuiComponents } from '../components/design/MuiComponents';
import { registerLayoutComponents } from '../components/design/LayoutComponents';

// Register all components
registerMuiComponents(componentRegistry);
registerLayoutComponents(componentRegistry);

/**
 * Design system with patterns content
 */
const DesignWithPatternsContent: React.FC = () => {
  const {
    instances,
    schemas,
    selectedId,
    hoveredId,
    registerSchemas,
    createInstance,
    updateInstance,
    deleteInstance,
    selectInstance,
    hoverInstance,
    getInstance,
    getSchema,
    clearAll,
  } = useDesignSystem();

  const [snackbar, setSnackbar] = React.useState({ open: false, message: '' });

  // Handle pattern schemas loaded
  const handlePatternsLoaded = useCallback(
    (patternSchemas: any[]) => {
      registerSchemas(patternSchemas);
      setSnackbar({ open: true, message: `Loaded ${patternSchemas.length} pattern schemas` });
    },
    [registerSchemas]
  );

  // Register all schemas on mount
  useEffect(() => {
    // Register MUI component schemas
    registerSchemas(muiComponentSchemas);
  }, [registerSchemas]);

  // Handle adding component from palette
  const handleAddComponent = (schemaId: string) => {
    const schema = schemas.get(schemaId);
    if (!schema) {
      console.error(`Schema ${schemaId} not found`);
      return;
    }

    // Create instance with default props
    const defaultProps: Record<string, any> = {};
    schema.props.forEach((prop) => {
      if (prop.default !== undefined) {
        defaultProps[prop.name] = prop.default;
      }
    });

    const id = createInstance(schemaId, defaultProps);
    selectInstance(id);
  };

  // Create a sample dashboard layout
  const createDashboardLayout = () => {
    // Clear existing
    clearAll();

    // Create page header
    const headerId = createInstance('PageHeader', {
      title: 'Analytics Dashboard',
      subtitle: 'Real-time data insights and metrics',
      showBreadcrumbs: true,
      showActions: true,
      actionLabel: 'Export Report',
    });

    // Create container
    const containerId = createInstance('Container', {
      maxWidth: 'xl',
      disableGutters: false,
    });

    // Create a stack for the main content
    const stackId = createInstance('Stack', {
      direction: 'column',
      spacing: 3,
    });

    // Create cards row
    const cardsRowId = createInstance('Stack', {
      direction: 'row',
      spacing: 2,
    });

    // Create data display cards
    const card1Id = createInstance('DataDisplayCard', {
      title: 'Total Revenue',
      value: '$45,234',
      trend: 'up',
      trendValue: '+12.5%',
      variant: 'default',
    });

    const card2Id = createInstance('DataDisplayCard', {
      title: 'Active Users',
      value: '1,234',
      trend: 'up',
      trendValue: '+5.2%',
      variant: 'minimal',
    });

    const card3Id = createInstance('DataDisplayCard', {
      title: 'Conversion Rate',
      value: '3.45%',
      trend: 'down',
      trendValue: '-2.1%',
      variant: 'detailed',
    });

    // Create a divider
    const dividerId = createInstance('Divider', {
      variant: 'middle',
    });

    // Create main content area
    const mainContentId = createInstance('Grid', {
      spacing: 3,
      direction: 'row',
    });

    // Create alert
    const alertId = createInstance('MuiAlert', {
      message: 'Your dashboard is using real-time data. Last updated 2 minutes ago.',
      severity: 'info',
      variant: 'outlined',
    });

    setSnackbar({ open: true, message: 'Dashboard layout created!' });
  };

  // Create a sample form layout
  const createFormLayout = () => {
    clearAll();

    const headerId = createInstance('PageHeader', {
      title: 'User Registration',
      subtitle: 'Create your account to get started',
      showBreadcrumbs: false,
      showActions: false,
    });

    const containerId = createInstance('Container', {
      maxWidth: 'sm',
    });

    const formStackId = createInstance('Stack', {
      direction: 'column',
      spacing: 3,
    });

    const field1Id = createInstance('MuiTextField', {
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      fullWidth: true,
    });

    const field2Id = createInstance('MuiTextField', {
      label: 'Email Address',
      placeholder: 'your@email.com',
      required: true,
      fullWidth: true,
      helperText: "We'll never share your email",
    });

    const field3Id = createInstance('MuiTextField', {
      label: 'Password',
      placeholder: 'Enter a secure password',
      required: true,
      fullWidth: true,
      type: 'password',
    });

    const buttonId = createInstance('MuiButton', {
      label: 'Create Account',
      variant: 'contained',
      color: 'primary',
      fullWidth: true,
      size: 'large',
    });

    setSnackbar({ open: true, message: 'Form layout created!' });
  };

  // Handle prop updates
  const handlePropsUpdate = (id: string, props: Record<string, any>) => {
    updateInstance(id, { props });
  };

  // Handle component duplication
  const handleDuplicate = (id: string) => {
    const original = getInstance(id);
    if (!original) {return;}

    const newProps = { ...original.props };
    if (newProps.title) {
      newProps.title = newProps.title + ' Copy';
    } else if (newProps.label) {
      newProps.label = newProps.label + ' Copy';
    }

    const newId = createInstance(original.schemaId, newProps);
    selectInstance(newId);
  };

  // Get selected instance and schema
  const selectedInstance = selectedId ? getInstance(selectedId) : null;
  const selectedSchema = selectedInstance ? getSchema(selectedInstance.schemaId) : null;

  const instanceArray = Array.from(instances.values());

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Load patterns */}
      <PatternLoader onPatternsLoaded={handlePatternsLoaded} />

      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5">Design System with Patterns</Typography>
            <Typography variant="caption" color="text.secondary">
              Compose layouts using pattern components from /patterns
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Dashboard />} onClick={createDashboardLayout}>
              Create Dashboard
            </Button>
            <Button variant="outlined" startIcon={<Add />} onClick={createFormLayout}>
              Create Form
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Component palette */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <ComponentPalette schemas={schemas} onAddComponent={handleAddComponent} />
        </Box>

        {/* Canvas area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ResponsiveCanvas onRefresh={clearAll}>
            {instanceArray.length === 0 ? (
              <Stack spacing={3} alignItems="center">
                <Alert severity="info">
                  Click "Create Dashboard" or "Create Form" to see example layouts
                </Alert>
                <Typography color="text.secondary">
                  Or select components from the palette to build your own
                </Typography>
              </Stack>
            ) : (
              <Box>
                {instanceArray.map((instance) => {
                  const schema = getSchema(instance.schemaId);
                  if (!schema) {return null;}

                  return (
                    <Box key={instance.id} sx={{ mb: 2 }}>
                      <PureSchemaComponent
                        schema={schema}
                        instance={instance}
                        isSelected={selectedId === instance.id}
                        isHovered={hoveredId === instance.id}
                        onSelect={selectInstance}
                        onHover={hoverInstance}
                        onUpdate={updateInstance}
                        onDelete={deleteInstance}
                        onDuplicate={handleDuplicate}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </ResponsiveCanvas>
        </Box>

        {/* Properties panel */}
        <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
          {selectedInstance && selectedSchema ? (
            <PurePropsForm
              schema={selectedSchema}
              instance={selectedInstance}
              onSave={(props) => handlePropsUpdate(selectedInstance.id, props)}
              onCancel={() => selectInstance(null)}
            />
          ) : (
            <Paper sx={{ p: 3, m: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Tips
              </Typography>
              <Stack spacing={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Patterns Available:</strong> PageHeader, DataDisplayCard,
                    EmptyStateCard, LabelValuePair
                  </Typography>
                </Alert>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Layout Components:</strong> Container, Stack, Grid, Divider
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Select any component to edit its properties
                </Typography>
              </Stack>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

/**
 * Design system with patterns
 */
export const DesignWithPatterns: React.FC = () => {
  return (
    <DesignSystemProvider>
      <DesignWithPatternsContent />
    </DesignSystemProvider>
  );
};
