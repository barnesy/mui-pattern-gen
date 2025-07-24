import React, { useEffect, useRef, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { AIDesignModeContext } from '../../contexts/AIDesignModeContext';
import { PatternPropsContext } from '../../contexts/PatternPropsContext';
import { PatternInstanceManager } from '../../services/PatternInstanceManager';

export interface SubComponentWrapperProps {
  componentName: string;
  componentType: string; // e.g., 'LabelValuePair', 'Button', etc.
  index?: number; // For components in arrays
  children: React.ReactNode;
  componentProps?: Record<string, unknown>;
}

/**
 * Wrapper for sub-components within patterns to enable individual selection
 * and editing in AI Design Mode
 */
export const SubComponentWrapper: React.FC<SubComponentWrapperProps> = ({
  componentName,
  componentType,
  index,
  children,
  componentProps = {},
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const patternContext = useContext(PatternPropsContext);
  const aiDesignContext = useContext(AIDesignModeContext);
  
  // Get parent pattern instance ID from context
  const parentInstanceId = patternContext?.instanceId;
  const [subInstanceId] = useState(() => 
    `${parentInstanceId}-${componentName}-${index || 0}-${Date.now()}`
  );

  // Check if AI Design Mode context is available
  const isInMainApp = !!aiDesignContext;
  const { isAIDesignMode, selectedPattern } = aiDesignContext || {};

  // Determine if this sub-component is selected
  const isSelected = selectedPattern?.instanceId === subInstanceId;

  useEffect(() => {
    if (!wrapperRef.current || !parentInstanceId) return;

    const element = wrapperRef.current;
    
    // Register sub-component with PatternInstanceManager
    const subComponentInfo = {
      id: subInstanceId,
      componentName,
      componentType,
      parentInstanceId,
      index,
      element,
      props: componentProps,
    };

    // Store sub-component info in element for click handling
    element.setAttribute('data-subcomponent-id', subInstanceId);
    element.setAttribute('data-subcomponent-name', componentName);
    element.setAttribute('data-subcomponent-type', componentType);
    element.setAttribute('data-parent-instance', parentInstanceId);
    if (index !== undefined) {
      element.setAttribute('data-subcomponent-index', index.toString());
    }

    // Register with PatternInstanceManager
    PatternInstanceManager.registerSubComponent(subComponentInfo);

    return () => {
      // Unregister sub-component
      PatternInstanceManager.unregisterSubComponent(subInstanceId);
    };
  }, [subInstanceId, componentName, componentType, parentInstanceId, index, componentProps]);

  // Update props when they change
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.setAttribute('data-subcomponent-props', JSON.stringify(componentProps));
    }
  }, [componentProps]);

  // Only show sub-component indicators in AI Design Mode
  if (!isInMainApp || !isAIDesignMode) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={wrapperRef}
      data-ai-subcomponent="true"
      data-ai-selected={isSelected}
      sx={{
        position: 'relative',
        display: 'inline-block',
        // Add subtle outline on hover in AI Design Mode
        '&:hover': {
          outline: '1px dashed rgba(156, 39, 176, 0.3)',
          outlineOffset: '2px',
          cursor: 'pointer',
        },
        // Stronger outline when selected
        '&[data-ai-selected="true"]': {
          outline: '2px solid rgba(156, 39, 176, 0.6)',
          outlineOffset: '2px',
        },
      }}
    >
      {children}
    </Box>
  );
};