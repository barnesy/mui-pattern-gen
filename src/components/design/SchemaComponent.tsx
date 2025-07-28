import React, { useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useDesignStore } from '../../stores/designStore';
import { useSchemaData } from '../../hooks/useSchemaData';
import { componentRegistry } from '../../schemas/registry';
import { DesignModeWrapper } from './DesignModeWrapper';

export interface SchemaComponentProps {
  instanceId: string;
  isEditing?: boolean;
}

/**
 * Single component wrapper that handles everything:
 * - Schema lookup
 * - Data fetching
 * - Prop management
 * - Design mode interaction
 */
export const SchemaComponent: React.FC<SchemaComponentProps> = React.memo(
  ({ instanceId, isEditing = true }) => {
    // Get instance and schema from store - use shallow comparison
    const instance = useDesignStore(
      React.useCallback((state) => state.getInstance(instanceId), [instanceId])
    );
    const schema = useDesignStore(
      React.useCallback(
        (state) => (instance ? state.getSchema(instance.schemaId) : null),
        [instance?.schemaId]
      )
    );
    const updateInstance = useDesignStore((state) => state.updateInstance);

    // Data fetching if configured
    const { data, loading, error } = useSchemaData(instance?.dataSource, schema?.dataShape);

    // Get the actual component from registry
    const Component = useMemo(() => {
      if (!schema) {return null;}
      return componentRegistry.get(schema.id) || componentRegistry.get(schema.name);
    }, [schema]);

    // Handle missing instance or schema
    if (!instance || !schema) {
      return <Alert severity="error">Component instance not found</Alert>;
    }

    // Handle missing component registration
    if (!Component) {
      return <Alert severity="warning">Component "{schema.name}" not registered</Alert>;
    }

    // Loading state
    if (loading && instance.dataSource) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} p={3}>
          <CircularProgress />
        </Box>
      );
    }

    // Error state
    if (error) {
      return <Alert severity="error">Failed to load data: {error.message}</Alert>;
    }

    // Merge props with data
    const finalProps = useMemo(() => {
      const props = { ...instance.props };

      // Add data if available
      if (data) {
        // If component expects data prop
        if (schema.dataShape) {
          props.data = data;
        } else {
          // Otherwise spread data into props
          Object.assign(props, data);
        }
      }

      return props;
    }, [instance.props, data, schema.dataShape]);

    // Update handler
    const handlePropsChange = (newProps: Record<string, any>) => {
      updateInstance(instanceId, { props: newProps });
    };

    // Render with or without design mode wrapper
    if (!isEditing) {
      return <Component {...finalProps} />;
    }

    return (
      <DesignModeWrapper
        instanceId={instanceId}
        schema={schema}
        instance={instance}
        onPropsChange={handlePropsChange}
      >
        <Component {...finalProps} />
      </DesignModeWrapper>
    );
  }
);

/**
 * Recursive component renderer for nested structures
 */
export const SchemaComponentTree: React.FC<{
  instanceId: string;
  isEditing?: boolean;
}> = React.memo(({ instanceId, isEditing = true }) => {
  const children = useDesignStore((state) => state.getChildren(instanceId));

  return (
    <>
      <SchemaComponent instanceId={instanceId} isEditing={isEditing} />
      {children.length > 0 && (
        <Box>
          {children.map((child) => (
            <SchemaComponentTree key={child.id} instanceId={child.id} isEditing={isEditing} />
          ))}
        </Box>
      )}
    </>
  );
});

/**
 * Hook to use a component instance
 */
export function useComponentInstance(instanceId: string) {
  const instance = useDesignStore((state) => state.getInstance(instanceId));
  const schema = useDesignStore((state) => (instance ? state.getSchema(instance.schemaId) : null));
  const updateProps = useDesignStore(
    (state) => (props: Record<string, any>) => state.updateInstance(instanceId, { props })
  );

  return {
    instance,
    schema,
    updateProps,
  };
}
