import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { ComponentSchema } from '../../schemas/types';
import { ComponentInstance } from '../../contexts/DesignSystemContext';
import { PaletteDragItem } from './DraggablePaletteItem';

export interface DragItem {
  type: 'component';
  instanceId: string;
  schemaId: string;
  parentId?: string;
  index: number;
}

export interface DraggableComponentProps {
  instance: ComponentInstance;
  schema: ComponentSchema;
  index: number;
  isSelected?: boolean;
  isHovered?: boolean;
  onMove?: (
    dragInstanceId: string,
    dropInstanceId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
  onDropNew?: (
    schemaId: string,
    parentId: string | undefined,
    position: 'before' | 'after' | 'inside',
    targetId: string
  ) => void;
  children: React.ReactNode;
  onDropTargetChange?: (instanceId: string, isDropTarget: boolean) => void;
}

/**
 * Wrapper that makes a component draggable and droppable
 */
export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  instance,
  schema,
  index,
  isSelected = false,
  isHovered = false,
  onMove,
  onDropNew,
  children,
  onDropTargetChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isContainer =
    schema.type === 'layout' ||
    schema.id === 'Container' ||
    schema.id === 'Stack' ||
    schema.id === 'Grid' ||
    schema.id === 'DataDisplayCard' ||
    schema.category === 'layout';

  // Drag source
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'component',
    item: {
      type: 'component',
      instanceId: instance.id,
      schemaId: instance.schemaId,
      parentId: instance.parentId,
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !instance.metadata?.locked,
  });

  // Drop target for before/after positioning
  const [{ isOverBefore, isOverAfter, canDropHere }, drop] = useDrop<
    DragItem | PaletteDragItem,
    unknown,
    { isOverBefore: boolean; isOverAfter: boolean; canDropHere: boolean }
  >({
    accept: ['component', 'new-component'],
    collect: (monitor) => {
      const isOver = monitor.isOver({ shallow: true });
      const canDrop = monitor.canDrop();
      const clientOffset = monitor.getClientOffset();

      if (!isOver || !clientOffset || !ref.current) {
        return { isOverBefore: false, isOverAfter: false, canDropHere: false };
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      return {
        isOverBefore: canDrop && hoverClientY < hoverMiddleY,
        isOverAfter: canDrop && hoverClientY >= hoverMiddleY,
        canDropHere: canDrop,
      };
    },
    canDrop: (item) => {
      // For existing components
      if (item.type === 'component') {
        // Can't drop on itself
        if (item.instanceId === instance.id) {return false;}

        // Can't drop on its own children
        // TODO: Implement proper cycle detection
      }

      return true;
    },
    drop: (item: DragItem | PaletteDragItem, monitor: DropTargetMonitor) => {
      if (!monitor.isOver({ shallow: true })) {return;}

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !ref.current) {return;}

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      // For containers, check if we're near the edges (not center)
      if (isContainer) {
        const edgeThreshold = 30;
        const isNearEdge =
          hoverClientY <= edgeThreshold ||
          hoverClientY >= hoverBoundingRect.height - edgeThreshold ||
          hoverClientX <= edgeThreshold ||
          hoverClientX >= hoverBoundingRect.width - edgeThreshold;

        if (!isNearEdge) {
          // We're in the center, let the container drop zone handle it
          return;
        }
      }

      const position = hoverClientY < hoverMiddleY ? 'before' : 'after';

      if (item.type === 'component' && onMove) {
        onMove(item.instanceId, instance.id, position);
      } else if (item.type === 'new-component' && onDropNew) {
        onDropNew(item.schemaId, instance.parentId, position, instance.id);
      }
    },
  });

  // Drop target for containers (drop inside)
  const [{ isOverInside, canDropInside }, dropInside] = useDrop<
    DragItem | PaletteDragItem,
    unknown,
    { isOverInside: boolean; canDropInside: boolean }
  >({
    accept: ['component', 'new-component'],
    collect: (monitor) => {
      const isOver = monitor.isOver({ shallow: true });
      const canDrop = monitor.canDrop();

      // For containers, check if we're over the component
      if (!isOver || !canDrop || !isContainer) {
        return { isOverInside: false, canDropInside: false };
      }

      // For empty containers, the whole area is a drop zone
      const hasChildren = instance.children && instance.children.length > 0;
      if (!hasChildren) {
        return {
          isOverInside: isOver,
          canDropInside: canDrop,
        };
      }

      // For containers with children, check if we're in the center area
      if (!ref.current) {
        return { isOverInside: false, canDropInside: false };
      }

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return { isOverInside: false, canDropInside: false };
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      // Check if we're in the center area (not too close to edges)
      const edgeThreshold = 30;
      const isInCenterY =
        hoverClientY > edgeThreshold && hoverClientY < hoverBoundingRect.height - edgeThreshold;
      const isInCenterX =
        hoverClientX > edgeThreshold && hoverClientX < hoverBoundingRect.width - edgeThreshold;

      return {
        isOverInside: isOver && isInCenterY && isInCenterX,
        canDropInside: canDrop,
      };
    },
    canDrop: (item) => {
      // Only containers can accept drops inside
      if (!isContainer) {return false;}

      // For existing components
      if (item.type === 'component') {
        // Can't drop on itself
        if (item.instanceId === instance.id) {return false;}

        // Can't drop parent into child
        if (item.instanceId === instance.parentId) {return false;}
      }

      return true;
    },
    drop: (item: DragItem | PaletteDragItem, monitor: DropTargetMonitor) => {
      if (!monitor.isOver({ shallow: true })) {return;}

      // For empty containers, drop directly inside
      const hasChildren = instance.children && instance.children.length > 0;
      if (!hasChildren) {
        if (item.type === 'component' && onMove) {
          onMove(item.instanceId, instance.id, 'inside');
        } else if (item.type === 'new-component' && onDropNew) {
          onDropNew(item.schemaId, instance.id, 'inside', instance.id);
        }
        return;
      }

      // For containers with children, check center area
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !ref.current) {return;}

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      const edgeThreshold = 30;
      const isInCenterY =
        hoverClientY > edgeThreshold && hoverClientY < hoverBoundingRect.height - edgeThreshold;
      const isInCenterX =
        hoverClientX > edgeThreshold && hoverClientX < hoverBoundingRect.width - edgeThreshold;

      if (isInCenterY && isInCenterX) {
        if (item.type === 'component' && onMove) {
          onMove(item.instanceId, instance.id, 'inside');
        } else if (item.type === 'new-component' && onDropNew) {
          onDropNew(item.schemaId, instance.id, 'inside', instance.id);
        }
      }
    },
  });

  // Combine refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(node);
    drop(node);
    if (isContainer) {
      dropInside(node);
    }
  };

  // Notify parent about drop target state
  React.useEffect(() => {
    if (onDropTargetChange && isContainer) {
      onDropTargetChange(instance.id, isOverInside);
    }
  }, [isOverInside, instance.id, isContainer, onDropTargetChange]);

  return (
    <Box
      ref={dragDropRef}
      sx={{
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        cursor: instance.metadata?.locked ? 'default' : 'move',
        transition: 'opacity 0.2s',

        // Drop indicators
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'primary.main',
          opacity: isOverBefore ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
          zIndex: 1000,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'primary.main',
          opacity: isOverAfter ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
          zIndex: 1000,
        },

        // Container drop zone indicator for empty containers
        ...(isContainer &&
          isOverInside &&
          (!instance.children || instance.children.length === 0) && {
            '& > *': {
              // Apply to the container's content
              backgroundColor: 'action.hover',
              borderColor: 'primary.main',
            },
          }),

        // Container drop zone for containers with children
        ...(isContainer &&
          isOverInside &&
          instance.children &&
          instance.children.length > 0 && {
            outline: '2px dashed',
            outlineColor: 'primary.main',
            outlineOffset: -4,
            backgroundColor: 'action.hover',
          }),
      }}
    >
      {/* Drag handle indicator - only show when not dragging */}
      {!instance.metadata?.locked && (isSelected || isHovered) && !isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 20,
            height: 20,
            cursor: 'move',
            opacity: 0.5,
            zIndex: 10,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              bgcolor: 'text.secondary',
            },
            '&::before': {
              top: 4,
              left: 2,
              right: 2,
              height: 2,
              borderRadius: 1,
            },
            '&::after': {
              top: 10,
              left: 2,
              right: 2,
              height: 2,
              borderRadius: 1,
            },
          }}
        />
      )}

      {children}
    </Box>
  );
};
