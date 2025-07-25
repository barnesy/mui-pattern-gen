import React, { useEffect, useRef, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { AIDesignModeContext, useAIDesignMode } from '../../contexts/AIDesignModeContext';
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
  
  // Get parent pattern instance ID from context
  const parentInstanceId = patternContext?.instanceId;
  const [subInstanceId] = useState(() => 
    `${parentInstanceId}-${componentName}-${index || 0}-${Date.now()}`
  );

  // Try to use AI Design Mode hook (will throw if not in context)
  let isEnabled = false;
  let selectedPattern: any = null;
  let isInMainApp = false;
  
  try {
    const aiDesignMode = useAIDesignMode();
    isEnabled = aiDesignMode.isEnabled;
    selectedPattern = aiDesignMode.selectedPattern;
    isInMainApp = true;
  } catch (e) {
    // Not in AI Design Mode context (e.g., in preview iframe)
  }

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

  // Debug logging
  if (import.meta.env.DEV && window.location.search.includes('debug=true')) {
    console.log('SubComponentWrapper render:', {
      componentName,
      parentInstanceId,
      isInMainApp,
      isEnabled,
      isSelected,
      subInstanceId
    });
  }

  // Only show sub-component indicators in AI Design Mode
  if (!isInMainApp || !isEnabled) {
    if (import.meta.env.DEV) {
      console.log('SubComponentWrapper bypassed:', {
        componentName,
        isInMainApp,
        isEnabled,
        reason: !isInMainApp ? 'Not in main app' : 'AI Design Mode disabled'
      });
    }
    return <>{children}</>;
  }

  return (
    <Box
      ref={wrapperRef}
      data-subcomponent-id={subInstanceId}
      data-ai-selected={isSelected ? 'true' : undefined}
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: '100%', // Take full width of parent
      }}
    >
      {children}
    </Box>
  );
};