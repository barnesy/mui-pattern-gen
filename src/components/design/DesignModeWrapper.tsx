import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, IconButton, Tooltip, useTheme } from '@mui/material';
import { DragIndicator, Delete, ContentCopy, Settings, Lock, LockOpen } from '@mui/icons-material';
import { ComponentSchema } from '../../schemas/types';
import { ComponentInstance, useDesignStore } from '../../stores/designStore';

export interface DesignModeWrapperProps {
  instanceId: string;
  schema: ComponentSchema;
  instance: ComponentInstance;
  onPropsChange: (props: Record<string, any>) => void;
  children: React.ReactNode;
}

/**
 * Wrapper that provides design mode interactions for components
 */
export const DesignModeWrapper: React.FC<DesignModeWrapperProps> = ({
  instanceId,
  schema,
  instance,
  onPropsChange,
  children,
}) => {
  const theme = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  const selectedId = useDesignStore((state) => state.selectedId);
  const hoveredId = useDesignStore((state) => state.hoveredId);
  const selectInstance = useDesignStore((state) => state.selectInstance);
  const hoverInstance = useDesignStore((state) => state.hoverInstance);
  const deleteInstance = useDesignStore((state) => state.deleteInstance);
  const duplicateInstance = useDesignStore((state) => state.duplicateInstance);
  const updateInstance = useDesignStore((state) => state.updateInstance);

  const isSelected = selectedId === instanceId;
  const isHovered = hoveredId === instanceId;
  const isLocked = instance.metadata?.locked;

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked) {
      selectInstance(instanceId);
    }
  };

  // Handle hover
  const handleMouseEnter = () => {
    hoverInstance(instanceId);
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    hoverInstance(null);
    setShowControls(false);
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteInstance(instanceId);
  };

  // Handle duplicate
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = duplicateInstance(instanceId);
    selectInstance(newId);
  };

  // Handle lock toggle
  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateInstance(instanceId, {
      metadata: {
        ...instance.metadata,
        locked: !isLocked,
      },
    });
  };

  // Register element for drag handling (if needed)
  useEffect(() => {
    if (!wrapperRef.current) {return;}

    const element = wrapperRef.current;
    element.setAttribute('data-instance-id', instanceId);
    element.setAttribute('data-schema-id', instance.schemaId);
    element.setAttribute('data-component-name', schema.name);

    return () => {
      element.removeAttribute('data-instance-id');
      element.removeAttribute('data-schema-id');
      element.removeAttribute('data-component-name');
    };
  }, [instanceId, instance.schemaId, schema.name]);

  return (
    <Box
      ref={wrapperRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        cursor: isLocked ? 'default' : 'pointer',
        outline: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : isHovered
            ? `1px solid ${theme.palette.primary.light}`
            : 'none',
        outlineOffset: 2,
        borderRadius: 1,
        transition: 'outline 0.2s ease',
        '&:hover': {
          bgcolor: isLocked ? 'transparent' : 'action.hover',
        },
      }}
    >
      {/* Component label */}
      {(isSelected || showControls) && (
        <Paper
          elevation={2}
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
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {schema.name}
          {instance.metadata?.name && (
            <span style={{ opacity: 0.7 }}>({instance.metadata.name})</span>
          )}
        </Paper>
      )}

      {/* Control buttons */}
      {(isSelected || showControls) && !isLocked && (
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
          <Tooltip title="Drag to move">
            <IconButton
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                cursor: 'move',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <DragIndicator fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={handleDuplicate}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isLocked ? 'Unlock' : 'Lock'}>
            <IconButton
              size="small"
              onClick={handleLockToggle}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {isLocked ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                color: 'error.main',
                '&:hover': { bgcolor: 'error.light' },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Component content */}
      {children}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: 0,
            fontSize: '0.625rem',
            color: 'text.disabled',
            fontFamily: 'monospace',
            display: isSelected ? 'block' : 'none',
          }}
        >
          {instanceId.slice(0, 8)}
        </Box>
      )}
    </Box>
  );
};
