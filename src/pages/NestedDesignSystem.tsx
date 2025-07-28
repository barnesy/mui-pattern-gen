import React, { useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import { Add, Dashboard, NavigateNext } from '@mui/icons-material';
import {
  DesignSystemProvider,
  useDesignSystem,
  ComponentInstance,
} from '../contexts/DesignSystemContext';
import { NestedSchemaComponent } from '../components/design/NestedSchemaComponent';
import { PurePropsForm } from '../components/design/PurePropsForm';
import { ComponentPalette } from '../components/design/ComponentPalette';
import { ResponsiveCanvas } from '../components/design/ResponsiveCanvas';
import { PatternLoader } from '../components/design/PatternLoader';
import { componentRegistry } from '../schemas/registry';
import { muiComponentSchemas } from '../schemas/patternSchemas';
import { registerMuiComponents } from '../components/design/MuiComponents';
import { registerLayoutComponents } from '../components/design/LayoutComponents';
import { ComponentSchema } from '../schemas/types';

// Register all components
registerMuiComponents(componentRegistry);
registerLayoutComponents(componentRegistry);

/**
 * Design system with nested component support
 */
const NestedDesignContent: React.FC = () => {
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
    getChildren,
    getAncestors,
    clearAll,
  } = useDesignSystem();

  // Handle pattern schemas loaded
  const handlePatternsLoaded = useCallback(
    (patternSchemas: any[]) => {
      registerSchemas(patternSchemas);
    },
    [registerSchemas]
  );

  // Register all schemas on mount
  useEffect(() => {
    // Register MUI component schemas
    registerSchemas(muiComponentSchemas);
  }, [registerSchemas]);

  // Handle adding component from palette
  const handleAddComponent = (schemaId: string, parentId?: string) => {
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

    const id = createInstance(schemaId, defaultProps, parentId);
    selectInstance(id);
  };

  // Create a nested dashboard layout
  const createNestedDashboard = () => {
    clearAll();

    // Create container
    const containerId = createInstance('Container', {
      maxWidth: 'xl',
      disableGutters: false,
    });

    // Create page header
    const headerId = createInstance(
      'PageHeader',
      {
        title: 'Analytics Dashboard',
        subtitle: 'Real-time data insights',
        showBreadcrumbs: true,
        showActions: true,
      },
      containerId
    );

    // Create a data display card
    const cardId = createInstance(
      'DataDisplayCard',
      {
        title: 'Performance Metrics',
        subtitle: 'Last 30 days',
        showHeader: true,
        showDivider: true,
      },
      containerId
    );

    // Create sub-components (LabelValuePairs) inside the card
    const stat1Id = createInstance(
      'LabelValuePair',
      {
        label: 'Total Revenue',
        value: '$125,430',
        variant: 'stacked',
        size: 'large',
        valueColor: 'primary',
        showTrend: true,
        trend: 'up',
        trendValue: '+12.5%',
      },
      cardId,
      {
        isSubComponent: true,
        subComponentType: 'stat',
      }
    );

    const stat2Id = createInstance(
      'LabelValuePair',
      {
        label: 'Active Users',
        value: '8,234',
        variant: 'stacked',
        size: 'large',
        valueColor: 'success',
        showTrend: true,
        trend: 'up',
        trendValue: '+5.2%',
      },
      cardId,
      {
        isSubComponent: true,
        subComponentType: 'stat',
      }
    );

    const stat3Id = createInstance(
      'LabelValuePair',
      {
        label: 'Conversion Rate',
        value: '3.45%',
        variant: 'stacked',
        size: 'large',
        valueColor: 'info',
        showTrend: true,
        trend: 'flat',
        trendValue: '0.0%',
      },
      cardId,
      {
        isSubComponent: true,
        subComponentType: 'stat',
      }
    );

    selectInstance(cardId);
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

    const newId = createInstance(original.schemaId, newProps, original.parentId, original.metadata);
    selectInstance(newId);
  };

  // Handle adding sub-component
  const handleAddSubComponent = (parentId: string, type: string, props: any) => {
    const id = createInstance(type, props, parentId, {
      isSubComponent: true,
      subComponentType: type,
    });
    selectInstance(id);
  };

  // Get selected instance and schema
  const selectedInstance = selectedId ? getInstance(selectedId) : null;
  const selectedSchema = selectedInstance ? getSchema(selectedInstance.schemaId) : null;
  const ancestors = selectedInstance ? getAncestors(selectedInstance.id) : [];

  // Recursive render function for nested components
  const renderComponent = (
    instance: ComponentInstance,
    schema: ComponentSchema
  ): React.ReactNode => {
    return (
      <NestedSchemaComponent
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
        getChildInstances={getChildren}
        getSchema={getSchema}
        renderChild={renderComponent}
      />
    );
  };

  // Get root instances (no parent)
  const rootInstances = Array.from(instances.values()).filter((inst) => !inst.parentId);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Load patterns */}
      <PatternLoader onPatternsLoaded={handlePatternsLoaded} />

      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5">Nested Design System</Typography>
            <Typography variant="caption" color="text.secondary">
              Support for sub-components and nested editing
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Dashboard />} onClick={createNestedDashboard}>
            Create Nested Dashboard
          </Button>
        </Stack>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Component palette */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <ComponentPalette
            schemas={schemas}
            onAddComponent={(schemaId) => handleAddComponent(schemaId, selectedId || undefined)}
          />
        </Box>

        {/* Canvas area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ResponsiveCanvas onRefresh={clearAll}>
            {rootInstances.length === 0 ? (
              <Stack spacing={3} alignItems="center">
                <Alert severity="info">
                  Click "Create Nested Dashboard" to see nested component support
                </Alert>
                <Typography color="text.secondary">
                  Sub-components can be individually selected and edited
                </Typography>
              </Stack>
            ) : (
              <Box>
                {rootInstances.map((instance) => {
                  const schema = getSchema(instance.schemaId);
                  if (!schema) {return null;}
                  return renderComponent(instance, schema);
                })}
              </Box>
            )}
          </ResponsiveCanvas>
        </Box>

        {/* Properties panel */}
        <Box sx={{ width: 360, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
          {selectedInstance && selectedSchema ? (
            <Box sx={{ p: 2 }}>
              {/* Breadcrumb navigation */}
              {ancestors.length > 0 && (
                <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
                  {ancestors.reverse().map((ancestor) => {
                    const ancestorSchema = getSchema(ancestor.schemaId);
                    return (
                      <Link
                        key={ancestor.id}
                        component="button"
                        variant="body2"
                        onClick={() => selectInstance(ancestor.id)}
                        underline="hover"
                      >
                        {ancestorSchema?.name || 'Component'}
                      </Link>
                    );
                  })}
                  <Typography color="text.primary" variant="body2">
                    {selectedSchema.name}
                  </Typography>
                </Breadcrumbs>
              )}

              {/* Component info */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">{selectedSchema.name}</Typography>
                {selectedInstance.metadata?.isSubComponent && (
                  <Chip label="Sub-component" size="small" color="secondary" variant="outlined" />
                )}
              </Stack>

              {/* Props form */}
              <PurePropsForm
                schema={selectedSchema}
                instance={selectedInstance}
                onSave={(props) => handlePropsUpdate(selectedInstance.id, props)}
                onCancel={() => selectInstance(null)}
              />

              {/* Add sub-components button */}
              {selectedSchema.id === 'DataDisplayCard' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Sub-components
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleAddSubComponent(selectedInstance.id, 'LabelValuePair', {
                          label: 'New Metric',
                          value: '0',
                          variant: 'default',
                        })
                      }
                    >
                      Add Metric
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          ) : (
            <Paper sx={{ p: 3, m: 2 }}>
              <Typography variant="h6" gutterBottom>
                Nested Components
              </Typography>
              <Stack spacing={2}>
                <Alert severity="info">
                  <Typography variant="body2">Components can contain other components</Typography>
                </Alert>
                <Alert severity="success">
                  <Typography variant="body2">
                    Sub-components can be individually selected and edited
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Create a nested dashboard to see it in action
                </Typography>
              </Stack>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Design system with nested component support
 */
export const NestedDesignSystem: React.FC = () => {
  return (
    <DesignSystemProvider>
      <NestedDesignContent />
    </DesignSystemProvider>
  );
};
