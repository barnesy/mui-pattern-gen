import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, Alert } from '@mui/material';
import { DesignSystemProvider, useDesignSystem } from '../contexts/DesignSystemContext';
import { PureSchemaComponent } from '../components/design/PureSchemaComponent';
import { PurePropsForm } from '../components/design/PurePropsForm';
import { ComponentPalette } from '../components/design/ComponentPalette';
import { ResponsiveCanvas } from '../components/design/ResponsiveCanvas';
import { componentRegistry } from '../schemas/registry';
import { muiComponentSchemas } from '../schemas/patternSchemas';
import { registerMuiComponents } from '../components/design/MuiComponents';

// Register MUI components
registerMuiComponents(componentRegistry);

/**
 * Enhanced design system content
 */
const EnhancedDesignContent: React.FC = () => {
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

  // Register all schemas on mount
  useEffect(() => {
    // Register MUI component schemas
    registerSchemas(muiComponentSchemas);

    // You can also register pattern schemas here
    // const patternSchemas = createSchemasForAcceptedPatterns(acceptedPatterns);
    // registerSchemas(patternSchemas);
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

  // Handle prop updates
  const handlePropsUpdate = (id: string, props: Record<string, any>) => {
    updateInstance(id, { props });
  };

  // Handle component duplication
  const handleDuplicate = (id: string) => {
    const original = getInstance(id);
    if (!original) {return;}

    // Duplicate with slightly modified props
    const newProps = { ...original.props };
    if (newProps.title) {
      newProps.title = newProps.title + ' Copy';
    } else if (newProps.label) {
      newProps.label = newProps.label + ' Copy';
    } else if (newProps.name) {
      newProps.name = newProps.name + ' Copy';
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
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5">Enhanced Design System</Typography>
        <Typography variant="caption" color="text.secondary">
          Pure React architecture with component palette, responsive preview, and MUI integration
        </Typography>
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
              <Alert severity="info">Select a component from the palette to get started</Alert>
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
              <Typography color="text.secondary" align="center">
                Select a component to edit its properties
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Enhanced design system with all features
 */
export const EnhancedDesignSystem: React.FC = () => {
  return (
    <DesignSystemProvider>
      <EnhancedDesignContent />
    </DesignSystemProvider>
  );
};
