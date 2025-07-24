import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { Box } from '@mui/material';
import { AIDesignModeContext } from '../../contexts/AIDesignModeContext';
import { PatternPropsProvider } from '../../contexts/PatternPropsContext';
import { PatternInstanceManager } from '../../services/PatternInstanceManager';

export interface PatternWrapperProps {
  patternName: string;
  status: 'pending' | 'accepted';
  category: string;
  children: React.ReactNode;
  patternProps?: Record<string, unknown>;
}

/**
 * Enhanced Pattern Wrapper that provides props through context
 * This ensures reliable prop updates without cloning issues
 */
export const PatternWrapper: React.FC<PatternWrapperProps> = ({
  patternName,
  status,
  category,
  children,
  patternProps: initialProps = {},
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [instanceId] = useState(() => 
    `${patternName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const [currentProps, setCurrentProps] = useState(initialProps);
  
  // Check if AI Design Mode context is available (not in iframe)
  const aiDesignContext = useContext(AIDesignModeContext);
  const isInMainApp = !!aiDesignContext;
  const { registerPatternInstance, unregisterPatternInstance } = aiDesignContext || {};

  // Update specific prop
  const updateProp = useCallback((name: string, value: unknown) => {
    setCurrentProps(prev => ({ ...prev, [name]: value }));
  }, []);

  // Update all props
  const updateAllProps = useCallback((newProps: Record<string, unknown>) => {
    setCurrentProps(newProps);
  }, [patternName, instanceId]);

  // Register instance on mount
  useEffect(() => {
    if (!wrapperRef.current) return;

    const element = wrapperRef.current;
    
    // Register with PatternInstanceManager
    PatternInstanceManager.registerInstance({
      patternName,
      location: {
        pathname: window.location.pathname,
        componentTree: [],
        iframe: window.parent !== window ? window.location.href : undefined,
      },
      element: new WeakRef(element),
    }, instanceId); // Pass our instanceId to ensure consistency

    // Register with AI Design Mode context (only in main app)
    if (isInMainApp && registerPatternInstance) {
      const patternInfo = {
        name: patternName,
        status,
        category,
        instanceId,
        props: currentProps,
        element,
        rect: element.getBoundingClientRect(),
      };
      
      registerPatternInstance(patternInfo);
    }

    // Cleanup on unmount
    return () => {
      PatternInstanceManager.unregisterInstance(instanceId);
      if (isInMainApp && unregisterPatternInstance) {
        unregisterPatternInstance(instanceId);
      }
    };
  }, [instanceId, patternName, status, category, isInMainApp, registerPatternInstance, unregisterPatternInstance]);

  // Subscribe to updates for this instance
  useEffect(() => {
    const handleUpdateRequest = (event: CustomEvent) => {
      const { instanceId: targetId, patternName: targetPattern, props, updateAll } = event.detail;
      
      if (updateAll && targetPattern === patternName) {
        updateAllProps(props);
      } else if (targetId === instanceId) {
        updateAllProps(props);
      }
    };

    const handlePatternUpdate = (data: {
      instanceId?: string;
      patternName?: string;
      updateAll?: boolean;
    }) => {
      // Handle cross-frame updates without props (props are managed by context)
      if (data.updateAll && data.patternName === patternName) {
        // Force re-render to pick up any external changes
        setCurrentProps(prev => ({ ...prev }));
      } else if (data.instanceId === instanceId) {
        // Force re-render to pick up any external changes
        setCurrentProps(prev => ({ ...prev }));
      }
    };

    // Listen for update requests
    window.addEventListener('pattern-update-request', handleUpdateRequest as EventListener);
    
    // Subscribe to pattern updates for cross-frame communication
    PatternInstanceManager.on('pattern-update', handlePatternUpdate);

    return () => {
      window.removeEventListener('pattern-update-request', handleUpdateRequest as EventListener);
      PatternInstanceManager.off('pattern-update', handlePatternUpdate);
    };
  }, [instanceId, patternName, updateAllProps]);

  // Only use initial props on mount, don't reset when they change
  // This prevents external prop changes from overwriting AI Design Mode updates

  // Add debug info in development
  const showDebug = process.env.NODE_ENV === 'development' && window.location.search.includes('debug=true');

  return (
    <PatternPropsProvider
      props={currentProps}
      instanceId={instanceId}
      patternName={patternName}
      updateProp={updateProp}
    >
      <Box
        ref={wrapperRef}
        data-pattern-name={patternName}
        data-pattern-status={status}
        data-pattern-category={category}
        data-pattern-instance={instanceId}
        data-pattern-props={JSON.stringify(currentProps)}
        sx={{ 
          position: 'relative',
          // Use block display to ensure outline works properly
          display: 'block',
          // Let the child component determine its own width
          width: '100%',
        }}
      >
        {showDebug && (
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: 0,
              fontSize: 10,
              bgcolor: 'background.paper',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              border: 1,
              borderColor: 'divider',
              zIndex: 9999,
            }}
          >
            {patternName} [{instanceId.slice(-8)}]
          </Box>
        )}
        {children}
      </Box>
    </PatternPropsProvider>
  );
};