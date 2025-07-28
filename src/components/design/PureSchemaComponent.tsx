import React, { useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ComponentSchema } from '../../schemas/types';
import { ComponentInstance } from '../../contexts/DesignSystemContext';
import { useSimpleData } from '../../hooks/useSimpleData';
import { componentRegistry } from '../../schemas/registry';

export interface PureSchemaComponentProps {
  schema: ComponentSchema;
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onUpdate?: (id: string, updates: Partial<ComponentInstance>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

/**
 * Pure React version of SchemaComponent - no store dependencies
 */
export const PureSchemaComponent: React.FC<PureSchemaComponentProps> = ({
  schema,
  instance,
  isSelected = false,
  isHovered = false,
  isEditing = true,
  onSelect,
  onHover,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  // Data fetching if configured
  const { data, loading, error } = useSimpleData(instance.dataSource);

  // Get the actual component from registry
  const Component = useMemo(() => {
    return componentRegistry.get(schema.id) || componentRegistry.get(schema.name);
  }, [schema.id, schema.name]);

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

  // Render without design mode wrapper if not editing
  if (!isEditing) {
    return <Component {...finalProps} />;
  }

  const isLocked = instance.metadata?.locked;

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        if (!isLocked) {
          onSelect?.(instance.id);
        }
      }}
      onMouseEnter={() => onHover?.(instance.id)}
      onMouseLeave={() => onHover?.(null)}
      sx={{
        position: 'relative',
        cursor: isLocked ? 'default' : 'pointer',
        outline: isSelected ? '2px solid #1976d2' : isHovered ? '1px solid #90caf9' : 'none',
        outlineOffset: 2,
        borderRadius: 1,
        transition: 'outline 0.2s ease',
        '&:hover': {
          bgcolor: isLocked ? 'transparent' : 'action.hover',
        },
      }}
    >
      {/* Component label */}
      {(isSelected || isHovered) && (
        <Box
          sx={{
            position: 'absolute',
            top: -32,
            left: 0,
            px: 1,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 500,
            bgcolor: isSelected ? 'primary.main' : 'background.paper',
            color: isSelected ? 'primary.contrastText' : 'text.primary',
            borderRadius: 1,
            zIndex: 1000,
            boxShadow: 1,
          }}
        >
          {schema.name}
          {instance.metadata?.name && (
            <span style={{ opacity: 0.7 }}>({instance.metadata.name})</span>
          )}
        </Box>
      )}

      {/* Control buttons */}
      {(isSelected || isHovered) && !isLocked && (
        <Box
          sx={{
            position: 'absolute',
            top: -32,
            right: 0,
            display: 'flex',
            gap: 0.5,
            zIndex: 1000,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(instance.id);
            }}
            style={{
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(instance.id);
            }}
            style={{
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#d32f2f',
            }}
          >
            Delete
          </button>
        </Box>
      )}

      {/* Component content */}
      <Component {...finalProps} />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && isSelected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: 0,
            fontSize: '0.625rem',
            color: 'text.disabled',
            fontFamily: 'monospace',
          }}
        >
          {instance.id.slice(0, 8)}
        </Box>
      )}
    </Box>
  );
};
