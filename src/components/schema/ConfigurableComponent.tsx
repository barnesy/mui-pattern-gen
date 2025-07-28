import React, { useMemo } from 'react';
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { ComponentSchema, DataSourceSchema } from '../../schemas/types';
import { useSchemaData } from '../../hooks/useSchemaData';
import { componentRegistry } from '../../schemas/registry';

export interface ConfigurableComponentProps {
  schema: ComponentSchema;
  dataSource?: DataSourceSchema;
  config?: Record<string, any>;
  onDataLoad?: (data: any) => void;
  onDataError?: (error: Error) => void;
}

/**
 * Base component that renders any schema-based component with data
 */
export const ConfigurableComponent: React.FC<ConfigurableComponentProps> = ({
  schema,
  dataSource,
  config = {},
  onDataLoad,
  onDataError,
}) => {
  // Fetch data if data source is provided
  const { data, loading, error, retry } = useSchemaData(dataSource, schema.dataShape, {
    onSuccess: onDataLoad,
    onError: onDataError,
  });

  // Get component from registry
  const Component = useMemo(() => {
    return componentRegistry.get(schema.id) || componentRegistry.get(schema.name);
  }, [schema.id, schema.name]);

  // Merge default props with config
  const finalProps = useMemo(() => {
    return {
      ...schema.defaultProps,
      ...config,
      data,
    };
  }, [schema.defaultProps, config, data]);

  // Loading state
  if (loading && dataSource) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" action={dataSource && <button onClick={retry}>Retry</button>}>
        <AlertTitle>Failed to load data</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  // Component not found
  if (!Component) {
    return (
      <Alert severity="warning">
        <AlertTitle>Component not found</AlertTitle>
        Component "{schema.name}" is not registered in the component registry.
      </Alert>
    );
  }

  // Render component
  return <Component {...finalProps} />;
};

/**
 * Higher-order component to make any component configurable
 */
export function withSchemaConfig<P extends { data?: any }>(
  Component: React.ComponentType<P>,
  defaultSchema?: Partial<ComponentSchema>
) {
  return React.forwardRef<any, ConfigurableComponentProps & Omit<P, 'data'>>((props, ref) => {
    const { schema, dataSource, config, ...restProps } = props;

    const mergedSchema = {
      ...defaultSchema,
      ...schema,
    } as ComponentSchema;

    if (!dataSource) {
      // No data source, render component directly
      return <Component ref={ref} {...(restProps as P)} {...config} />;
    }

    // Use ConfigurableComponent for data fetching
    return (
      <ConfigurableComponent
        schema={mergedSchema}
        dataSource={dataSource}
        config={{ ...restProps, ...config }}
      />
    );
  });
}

/**
 * Skeleton loader that adapts to component schema
 */
export const ConfigurableComponentSkeleton: React.FC<{
  schema: ComponentSchema;
}> = ({ schema }) => {
  // Adapt skeleton based on component type
  const getSkeletonHeight = () => {
    switch (schema.type) {
      case 'display':
        return 200;
      case 'form':
        return 300;
      case 'layout':
        return 400;
      case 'navigation':
        return 64;
      default:
        return 200;
    }
  };

  return (
    <Box
      sx={{
        height: getSkeletonHeight(),
        bgcolor: 'action.hover',
        borderRadius: 1,
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': { opacity: 0.6 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.6 },
        },
      }}
    />
  );
};
