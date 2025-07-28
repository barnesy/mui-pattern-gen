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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  NavigateNext,
  ContentCopy,
  ContentPaste,
  Undo,
  Redo,
  Save,
  Code as CodeIcon,
} from '@mui/icons-material';
import {
  DesignSystemProvider,
  useDesignSystem,
  ComponentInstance,
} from '../contexts/DesignSystemContext';
import { NestedSchemaComponent } from '../components/design/NestedSchemaComponent';
import { DraggableComponent } from '../components/design/DraggableComponent';
import { PurePropsForm } from '../components/design/PurePropsForm';
import { DraggableComponentPalette } from '../components/design/DraggableComponentPalette';
import { DndProvider } from '../components/design/DndProvider';
import { ResponsiveCanvas } from '../components/design/ResponsiveCanvas';
import { PatternLoader } from '../components/design/PatternLoader';
import { componentRegistry } from '../schemas/registry';
import { muiComponentSchemas } from '../schemas/patternSchemas';
import { registerMuiComponents } from '../components/design/MuiComponents';
import { registerLayoutComponents } from '../components/design/LayoutComponents';
import { ComponentSchema } from '../schemas/types';
import { useDrop } from 'react-dnd';
import { PaletteDragItem } from '../components/design/DraggablePaletteItem';

// Register all components
registerMuiComponents(componentRegistry);
registerLayoutComponents(componentRegistry);

/**
 * Canvas drop zone for new components
 */
const CanvasDropZone: React.FC<{
  onDrop: (schemaId: string) => void;
  children: React.ReactNode;
}> = ({ onDrop, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop<
    PaletteDragItem,
    unknown,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: 'new-component',
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
    drop: (item: PaletteDragItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) {return;}
      onDrop(item.schemaId);
    },
  });

  return (
    <Box
      ref={drop}
      sx={{
        flex: 1,
        bgcolor: isOver && canDrop ? 'action.hover' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Drag and drop design system content
 */
const DragDropDesignContent: React.FC = () => {
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

  const [copiedInstance, setCopiedInstance] = React.useState<ComponentInstance | null>(null);
  const [dropTargets, setDropTargets] = React.useState<Set<string>>(new Set());

  // Handle pattern schemas loaded
  const handlePatternsLoaded = useCallback(
    (patternSchemas: any[]) => {
      registerSchemas(patternSchemas);
    },
    [registerSchemas]
  );

  // Register all schemas on mount
  useEffect(() => {
    registerSchemas(muiComponentSchemas);
  }, [registerSchemas]);

  // Handle adding component
  const handleAddComponent = (
    schemaId: string,
    parentId?: string,
    position?: 'before' | 'after' | 'inside',
    targetId?: string
  ) => {
    const schema = schemas.get(schemaId);
    if (!schema) {return;}

    const defaultProps: Record<string, any> = {};
    schema.props.forEach((prop) => {
      if (prop.default !== undefined) {
        defaultProps[prop.name] = prop.default;
      }
    });

    // Create the new instance
    const id = createInstance(schemaId, defaultProps, parentId);

    // If we have a target position, handle insertion
    if (targetId && position && position !== 'inside') {
      const targetInstance = getInstance(targetId);
      if (targetInstance?.parentId) {
        const parentInstance = getInstance(targetInstance.parentId);
        if (parentInstance?.children) {
          const children = [...parentInstance.children];
          const targetIndex = children.indexOf(targetId);
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

          // Remove the newly created instance from its current position
          const filteredChildren = children.filter((childId) => childId !== id);

          // Insert at the correct position
          filteredChildren.splice(insertIndex, 0, id);

          updateInstance(targetInstance.parentId, { children: filteredChildren });
        }
      }
    }

    selectInstance(id);
  };

  // Handle moving components
  const handleMoveComponent = (
    dragInstanceId: string,
    dropInstanceId: string,
    position: 'before' | 'after' | 'inside'
  ) => {
    const dragInstance = getInstance(dragInstanceId);
    const dropInstance = getInstance(dropInstanceId);

    if (!dragInstance || !dropInstance) {return;}

    // Prevent dropping a parent into its own child
    const isDescendant = (parentId: string, childId: string): boolean => {
      const child = getInstance(childId);
      if (!child) {return false;}
      if (child.parentId === parentId) {return true;}
      if (child.parentId) {return isDescendant(parentId, child.parentId);}
      return false;
    };

    if (isDescendant(dragInstanceId, dropInstanceId)) {
      console.warn('Cannot drop a parent into its own child');
      return;
    }

    // Remove from old parent
    if (dragInstance.parentId) {
      const oldParent = getInstance(dragInstance.parentId);
      if (oldParent) {
        const newChildren = (oldParent.children || []).filter((id) => id !== dragInstanceId);
        updateInstance(dragInstance.parentId, { children: newChildren });
      }
    } else {
      // Remove from root if no parent
      const rootInstances = Array.from(instances.values()).filter((inst) => !inst.parentId);
      // No need to update root list as it's computed
    }

    if (position === 'inside') {
      // Add to new parent
      const newChildren = [...(dropInstance.children || []), dragInstanceId];
      updateInstance(dropInstanceId, { children: newChildren });
      updateInstance(dragInstanceId, { parentId: dropInstanceId });
    } else {
      // Insert before/after
      const dropParentId = dropInstance.parentId;
      if (dropParentId) {
        const dropParent = getInstance(dropParentId);
        if (dropParent) {
          const children = [...(dropParent.children || [])];
          const dropIndex = children.indexOf(dropInstanceId);
          const insertIndex = position === 'before' ? dropIndex : dropIndex + 1;

          // Remove drag item if it's already in this parent
          const filteredChildren = children.filter((id) => id !== dragInstanceId);

          // Insert at new position
          filteredChildren.splice(insertIndex, 0, dragInstanceId);

          updateInstance(dropParentId, { children: filteredChildren });
          updateInstance(dragInstanceId, { parentId: dropParentId });
        }
      } else {
        // Dropping at root level
        updateInstance(dragInstanceId, { parentId: undefined });
      }
    }
  };

  // Copy/paste functionality
  const handleCopy = () => {
    if (selectedId) {
      const instance = getInstance(selectedId);
      if (instance) {
        setCopiedInstance(instance);
      }
    }
  };

  const handlePaste = () => {
    if (copiedInstance) {
      const newProps = { ...copiedInstance.props };
      if (newProps.title) {newProps.title += ' Copy';}
      if (newProps.label) {newProps.label += ' Copy';}

      const newId = createInstance(
        copiedInstance.schemaId,
        newProps,
        selectedId || copiedInstance.parentId,
        copiedInstance.metadata
      );
      selectInstance(newId);
    }
  };

  // Export to code
  const handleExportCode = () => {
    // TODO: Implement code export
    console.log('Export to React code - coming soon!');
  };

  // Create demo
  const createDragDropDemo = () => {
    clearAll();

    const containerId = createInstance('Container', { maxWidth: 'lg' });

    const stackId = createInstance(
      'Stack',
      {
        direction: 'column',
        spacing: 3,
      },
      containerId
    );

    const headerId = createInstance(
      'PageHeader',
      {
        title: 'Drag & Drop Demo',
        subtitle: 'Drag components to rearrange',
      },
      stackId
    );

    const gridId = createInstance(
      'Grid',
      {
        spacing: 2,
        direction: 'row',
      },
      stackId
    );

    // Update the grid to be ready to accept children
    updateInstance(gridId, { children: [] });

    const card1Id = createInstance('MuiCard', {
      title: 'Drag Me!',
      content: 'I can be moved around',
      elevation: 2,
    });

    const card2Id = createInstance('MuiCard', {
      title: 'Drop Zone',
      content: 'Drop components on me',
      elevation: 2,
    });

    // Add cards to the grid
    updateInstance(gridId, { children: [card1Id, card2Id] });
    updateInstance(card1Id, { parentId: gridId });
    updateInstance(card2Id, { parentId: gridId });

    selectInstance(containerId);
  };

  // Handle drop target changes
  const handleDropTargetChange = useCallback((instanceId: string, isDropTarget: boolean) => {
    setDropTargets((prev) => {
      const next = new Set(prev);
      if (isDropTarget) {
        next.add(instanceId);
      } else {
        next.delete(instanceId);
      }
      return next;
    });
  }, []);

  // Recursive render with drag support
  const renderComponent = (
    instance: ComponentInstance,
    schema: ComponentSchema,
    index: number
  ): React.ReactNode => {
    const component = (
      <NestedSchemaComponent
        key={instance.id}
        schema={schema}
        instance={instance}
        isSelected={selectedId === instance.id}
        isHovered={hoveredId === instance.id}
        isDropTarget={dropTargets.has(instance.id)}
        onSelect={selectInstance}
        onHover={hoverInstance}
        onUpdate={updateInstance}
        onDelete={deleteInstance}
        onDuplicate={(id) => {
          const inst = getInstance(id);
          if (inst) {
            setCopiedInstance(inst);
            handlePaste();
          }
        }}
        getChildInstances={getChildren}
        getSchema={getSchema}
        renderChild={(childInstance, childSchema) => {
          const siblings = instance.children || [];
          const childIndex = siblings.indexOf(childInstance.id);
          return renderComponent(childInstance, childSchema, childIndex);
        }}
      />
    );

    // Wrap in draggable
    return (
      <DraggableComponent
        key={instance.id}
        instance={instance}
        schema={schema}
        index={index}
        isSelected={selectedId === instance.id}
        isHovered={hoveredId === instance.id}
        onMove={handleMoveComponent}
        onDropNew={handleAddComponent}
        onDropTargetChange={handleDropTargetChange}
      >
        {component}
      </DraggableComponent>
    );
  };

  const selectedInstance = selectedId ? getInstance(selectedId) : null;
  const selectedSchema = selectedInstance ? getSchema(selectedInstance.schemaId) : null;
  const ancestors = selectedInstance ? getAncestors(selectedInstance.id) : [];
  const rootInstances = Array.from(instances.values()).filter((inst) => !inst.parentId);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PatternLoader onPatternsLoaded={handlePatternsLoaded} />

      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5">Drag & Drop Design System</Typography>
            <Typography variant="caption" color="text.secondary">
              Drag components to build and rearrange layouts
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Dashboard />} onClick={createDragDropDemo}>
              Create Demo
            </Button>

            <Tooltip title="Copy">
              <span>
                <IconButton onClick={handleCopy} disabled={!selectedId}>
                  <ContentCopy />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Paste">
              <span>
                <IconButton onClick={handlePaste} disabled={!copiedInstance}>
                  <ContentPaste />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Export Code">
              <IconButton onClick={handleExportCode}>
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Component palette */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <DraggableComponentPalette
            schemas={schemas}
            onAddComponent={(schemaId) =>
              handleAddComponent(schemaId, selectedId || undefined, 'inside')
            }
          />
        </Box>

        {/* Canvas area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ResponsiveCanvas onRefresh={clearAll}>
            <CanvasDropZone
              onDrop={(schemaId) => handleAddComponent(schemaId, undefined, 'inside')}
            >
              {rootInstances.length === 0 ? (
                <Stack spacing={3} alignItems="center" sx={{ pt: 8 }}>
                  <Alert severity="info">
                    Drag components from the palette or click "Create Demo"
                  </Alert>
                  <Stack spacing={1} alignItems="center">
                    <Typography color="text.secondary">• Drag to add components</Typography>
                    <Typography color="text.secondary">• Drop on containers to nest</Typography>
                    <Typography color="text.secondary">
                      • Drag between components to reorder
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  {rootInstances.map((instance, index) => {
                    const schema = getSchema(instance.schemaId);
                    if (!schema) {return null;}
                    return renderComponent(instance, schema, index);
                  })}
                </Box>
              )}
            </CanvasDropZone>
          </ResponsiveCanvas>
        </Box>

        {/* Properties panel */}
        <Box sx={{ width: 360, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
          {selectedInstance && selectedSchema ? (
            <Box sx={{ p: 2 }}>
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

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">{selectedSchema.name}</Typography>
                {selectedInstance.metadata?.isSubComponent && (
                  <Chip label="Sub-component" size="small" color="secondary" variant="outlined" />
                )}
              </Stack>

              <PurePropsForm
                schema={selectedSchema}
                instance={selectedInstance}
                onSave={(props) => updateInstance(selectedInstance.id, { props })}
                onCancel={() => selectInstance(null)}
              />
            </Box>
          ) : (
            <Paper sx={{ p: 3, m: 2 }}>
              <Typography variant="h6" gutterBottom>
                Drag & Drop Features
              </Typography>
              <Stack spacing={2}>
                <Alert severity="success">Drag components from palette to canvas</Alert>
                <Alert severity="info">Drop on containers to create nested layouts</Alert>
                <Alert severity="warning">Drag existing components to reorder</Alert>
              </Stack>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Drag and drop design system
 */
export const DragDropDesignSystem: React.FC = () => {
  return (
    <DesignSystemProvider>
      <DndProvider>
        <DragDropDesignContent />
      </DndProvider>
    </DesignSystemProvider>
  );
};
