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
import {
  DesignSystemProvider,
  useDesignSystem,
  ComponentInstance,
} from '../contexts/DesignSystemContext';
import { PureSchemaComponent } from '../components/design/PureSchemaComponent';
import { PurePropsForm } from '../components/design/PurePropsForm';
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
 * Inner component that uses the design system context
 */
const DesignSystemContent: React.FC = () => {
  const {
    instances,
    schemas,
    selectedId,
    hoveredId,
    registerSchema,
    createInstance,
    updateInstance,
    deleteInstance,
    selectInstance,
    hoverInstance,
    getInstance,
    getSchema,
  } = useDesignSystem();

  // Register schemas on mount
  useEffect(() => {
    registerSchema({
      id: 'TestComponent',
      name: 'Test Component',
      type: 'display',
      props: [
        {
          name: 'title',
          type: 'string',
          label: 'Title',
          default: 'Test Component',
          group: 'General',
        },
        {
          name: 'value',
          type: 'number',
          label: 'Value',
          default: 0,
          group: 'General',
        },
      ],
    });
  }, [registerSchema]);

  // Create demo instance
  const handleCreateComponent = () => {
    console.log('Creating test component...');
    try {
      const id = createInstance('TestComponent', {
        title: 'My Test Component',
        value: 42,
      });
      console.log('Created instance:', id);
      selectInstance(id);
    } catch (error) {
      console.error('Error creating component:', error);
    }
  };

  // Handle prop updates
  const handlePropsUpdate = (id: string, props: Record<string, any>) => {
    updateInstance(id, { props });
  };

  // Handle component duplication
  const handleDuplicate = (id: string) => {
    const original = getInstance(id);
    const schema = original ? getSchema(original.schemaId) : null;

    if (original && schema) {
      const newId = createInstance(original.schemaId, {
        ...original.props,
        title: (original.props.title || 'Component') + ' Copy',
      });
      selectInstance(newId);
    }
  };

  // Get selected instance and schema
  const selectedInstance = selectedId ? getInstance(selectedId) : null;
  const selectedSchema = selectedInstance ? getSchema(selectedInstance.schemaId) : null;

  const instanceArray = Array.from(instances.values());

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Pure React Design System
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          This uses pure React patterns - no Zustand, no complex state management, no infinite
          loops!
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

              <Box sx={{ mt: 3 }}>
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
                        color: 'white',
                      }}
                    >
                      {key}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Canvas */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                minHeight: 600,
                bgcolor: 'grey.50',
                position: 'relative',
              }}
              onClick={() => selectInstance(null)}
            >
              {instanceArray.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">
                    Click "Add Test Component" to get started
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {instanceArray.map((instance) => {
                    const schema = getSchema(instance.schemaId);
                    if (!schema) {return null;}

                    return (
                      <PureSchemaComponent
                        key={instance.id}
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
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>

          {/* Properties panel */}
          <Grid item xs={12} md={3}>
            {selectedInstance && selectedSchema ? (
              <PurePropsForm
                schema={selectedSchema}
                instance={selectedInstance}
                onSave={(props) => handlePropsUpdate(selectedInstance.id, props)}
                onCancel={() => selectInstance(null)}
              />
            ) : (
              <Paper sx={{ p: 2, height: 600 }}>
                <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                  Select a component to edit its properties
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Debug info */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                Schemas Registered
              </Typography>
              <Typography variant="h4" color="primary">
                {schemas.size}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                Component Instances
              </Typography>
              <Typography variant="h4" color="secondary">
                {instances.size}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Component
              </Typography>
              <Typography variant="body2">
                {selectedInstance ? selectedInstance.id.slice(0, 8) : 'None'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * Main component with provider wrapper
 */
export const PureDesignSystem: React.FC = () => {
  return (
    <DesignSystemProvider>
      <DesignSystemContent />
    </DesignSystemProvider>
  );
};
