import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { Box } from '@mui/material';
import { AIDesignModeContext } from '../../contexts/AIDesignModeContext';
import { PatternPropsProvider } from '../../contexts/PatternPropsContext';
import { PatternInstanceManager } from '../../services/PatternInstanceManager';
import { usePropsStore, useComponentProps } from '../../contexts/PropsStoreContext';

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
  const [instanceId] = useState(
    () => `${patternName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Use PropsStore for centralized props management
  const propsStore = usePropsStore();
  const storedProps = useComponentProps(instanceId);
  const currentProps = storedProps || initialProps;

  // Check if AI Design Mode context is available (not in iframe)
  const aiDesignContext = useContext(AIDesignModeContext);
  const isInMainApp = !!aiDesignContext;
  const { registerPatternInstance, unregisterPatternInstance } = aiDesignContext || {};

  // Update specific prop
  const updateProp = useCallback(
    (name: string, value: unknown) => {
      propsStore.updateProps(instanceId, { [name]: value });
    },
    [instanceId, propsStore]
  );

  // Update all props
  const updateAllProps = useCallback(
    (newProps: Record<string, unknown>) => {
      propsStore.updateProps(instanceId, newProps);
    },
    [instanceId, propsStore]
  );

  // Register instance on mount
  useEffect(() => {
    if (!wrapperRef.current) {return;}

    const element = wrapperRef.current;

    // Register with PropsStore
    propsStore.registerComponent({
      id: instanceId,
      type: 'pattern',
      name: patternName,
      props: initialProps,
      metadata: {
        category,
        status,
      },
    });

    // Register with PatternInstanceManager
    PatternInstanceManager.registerInstance(
      {
        patternName,
        location: {
          pathname: window.location.pathname,
          componentTree: [],
          iframe: window.parent !== window ? window.location.href : undefined,
        },
        element: element as any, // WeakRef type not available in all environments
      },
      instanceId
    ); // Pass our instanceId to ensure consistency

    // Register with AI Design Mode context (only in main app)
    if (isInMainApp && registerPatternInstance) {
      const patternInfo = {
        name: patternName,
        status,
        category,
        instanceId,
        props: initialProps, // Use initialProps instead of currentProps
        element,
        rect: element.getBoundingClientRect(),
      };

      registerPatternInstance(patternInfo);
    }

    // Cleanup on unmount
    return () => {
      propsStore.unregisterComponent(instanceId);
      PatternInstanceManager.unregisterInstance(instanceId);
      if (isInMainApp && unregisterPatternInstance) {
        unregisterPatternInstance(instanceId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]); // Only depend on instanceId which is stable

  // Subscribe to updates for this instance
  useEffect(() => {
    const handleUpdateRequest = (event: CustomEvent) => {
      const { instanceId: targetId, patternName: targetPattern, props, updateAll } = event.detail;

      if (updateAll && targetPattern === patternName) {
        propsStore.updateAllByName(patternName, props);
      } else if (targetId === instanceId) {
        propsStore.updateProps(instanceId, props);
      }
    };

    const handlePatternUpdate = (data: {
      instanceId?: string;
      patternName?: string;
      updateAll?: boolean;
    }) => {
      // Handle cross-frame updates without props (props are managed by context)
      if (data.updateAll && data.patternName === patternName) {
        // Props will be updated via PropsStore subscription
      } else if (data.instanceId === instanceId) {
        // Props will be updated via PropsStore subscription
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
  const showDebug = import.meta.env.DEV && window.location.search.includes('debug=true');

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
