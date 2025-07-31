import React, { useEffect, useRef, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { useConfigurationMode } from '../../contexts/ConfigurationModeContext';
import { PatternPropsContext } from '../../contexts/PatternPropsContext';
import { PatternInstanceManager } from '../../services/PatternInstanceManager';
import { SubComponentType } from '../../types/SubComponentTypes';
import { usePropsStore, useComponentProps } from '../../contexts/PropsStoreContext';

export interface SubComponentWrapperProps {
  componentName: string;
  componentType: SubComponentType;
  index?: number; // For components in arrays
  children: React.ReactNode;
  componentProps?: Record<string, unknown>;
}

/**
 * Wrapper for sub-components within patterns to enable individual selection
 * and editing in Configuration Mode
 */
const SubComponentWrapperComponent: React.FC<SubComponentWrapperProps> = ({
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
  const [subInstanceId] = useState(
    () => `${parentInstanceId}-${componentName}-${index ?? 0}-${Date.now()}`
  );

  // Use PropsStore for centralized props management
  const propsStore = usePropsStore();
  const storedProps = useComponentProps(subInstanceId);
  const currentProps = storedProps ?? componentProps;

  // Try to use Configuration Mode hook (will throw if not in context)
  let isEnabled = false;
  let selectedPattern: { instanceId?: string } | null = null;
  let isInMainApp = false;

  try {
    const configurationMode = useConfigurationMode();
    isEnabled = configurationMode.isEnabled;
    selectedPattern = configurationMode.selectedPattern;
    isInMainApp = true;
  } catch (e) {
    // Not in Configuration Mode context (e.g., in preview iframe)
  }

  // Determine if this sub-component is selected
  const isSelected = selectedPattern?.instanceId === subInstanceId;

  // Use props from store
  const effectiveProps = currentProps;

  useEffect(() => {
    if (!wrapperRef.current || !parentInstanceId) return;

    const element = wrapperRef.current;

    // Register with PropsStore
    propsStore.registerComponent({
      id: subInstanceId,
      type: 'subcomponent',
      name: componentName,
      props: componentProps,
      parentId: parentInstanceId,
      metadata: {
        componentType,
        index,
      },
    });

    // Register sub-component with PatternInstanceManager
    const subComponentInfo = {
      id: subInstanceId,
      componentName,
      componentType,
      parentInstanceId,
      index,
      element,
      props: componentProps, // Use componentProps instead of currentProps
    };

    // Store sub-component info in element for click handling
    // Set attributes immediately
    element.setAttribute('data-subcomponent-id', subInstanceId);
    element.setAttribute('data-subcomponent-name', componentName);
    element.setAttribute('data-subcomponent-type', componentType);
    element.setAttribute('data-parent-instance', parentInstanceId);
    element.setAttribute('data-subcomponent-props', JSON.stringify(componentProps));
    if (index !== undefined) {
      element.setAttribute('data-subcomponent-index', index.toString());
    }

    // Register with PatternInstanceManager
    PatternInstanceManager.registerSubComponent(subComponentInfo);

    return () => {
      // Unregister from PropsStore
      propsStore.unregisterComponent(subInstanceId);
      // Unregister sub-component
      PatternInstanceManager.unregisterSubComponent(subInstanceId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subInstanceId]); // Only depend on stable ID

  // Listen for sub-component update events
  useEffect(() => {
    const handleUpdateRequest = (event: CustomEvent): void => {
      const { instanceId, props } = event.detail as { instanceId: string; props: Record<string, unknown> };

      // Only log if debug flag is set
      if (import.meta.env.DEV && window.localStorage.getItem('debug-subcomponents') === 'true') {
        // eslint-disable-next-line no-console
        console.log('SubComponentWrapper: Event received', {
          componentName,
          eventInstanceId: instanceId,
          subInstanceId,
          matches: instanceId === subInstanceId,
          props: JSON.stringify(props, null, 2),
        });
      }

      if (instanceId === subInstanceId) {
        if (import.meta.env.DEV && window.localStorage.getItem('debug-subcomponents') === 'true') {
          // eslint-disable-next-line no-console
          console.log('SubComponentWrapper: Updating props!', {
            componentName,
            oldProps: currentProps,
            newProps: props as Record<string, unknown>,
          });
        }
        // Update props in PropsStore
        propsStore.updateProps(subInstanceId, props);
      }
    };

    // Listen for the update event
    window.addEventListener('subcomponent-update-request', handleUpdateRequest as EventListener);

    return () => {
      window.removeEventListener(
        'subcomponent-update-request',
        handleUpdateRequest as EventListener
      );
    };
  }, [subInstanceId, componentName, currentProps, propsStore]);

  // Update props when they change
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.setAttribute('data-subcomponent-props', JSON.stringify(effectiveProps));
    }
  }, [effectiveProps]);

  // If not in main app (e.g., in iframe), return children with minimal wrapper
  if (!isInMainApp) {
    return <>{children}</>;
  }

  // If Configuration Mode is disabled, return children with data attributes only
  // This allows the element to be selectable when Configuration Mode is turned on later
  if (!isEnabled) {
    return (
      <span
        ref={wrapperRef}
        data-subcomponent-id={subInstanceId}
        data-subcomponent-name={componentName}
        data-subcomponent-type={componentType}
        data-parent-instance={parentInstanceId}
        data-subcomponent-props={JSON.stringify(effectiveProps)}
        data-subcomponent-index={index !== undefined ? index.toString() : undefined}
        style={{ display: 'contents' }} // CSS display: contents makes the span act as if it doesn't exist
      >
        {React.isValidElement(children) && typeof children.type === 'string'
          ? children // Don't pass props to DOM elements
          : React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, effectiveProps)
          : children}
      </span>
    );
  }

  // Configuration Mode is enabled - render full interactive wrapper
  return (
    <Box
      ref={wrapperRef}
      data-subcomponent-id={subInstanceId}
      data-subcomponent-name={componentName}
      data-subcomponent-type={componentType}
      data-parent-instance={parentInstanceId}
      data-subcomponent-props={JSON.stringify(effectiveProps)}
      data-subcomponent-index={index !== undefined ? index.toString() : undefined}
      data-config-selected={isSelected ? 'true' : undefined}
      sx={{
        position: 'relative',
        display: 'block',
        cursor: 'pointer',
        outline: isSelected ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        outlineOffset: 2,
        transition: 'outline 0.2s ease-in-out',
        // Ensure it's clickable on mobile
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
    >
      {React.isValidElement(children) && typeof children.type === 'string'
        ? children // Don't pass props to DOM elements
        : React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, effectiveProps)
        : children}
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SubComponentWrapper = React.memo(
  SubComponentWrapperComponent,
  (prevProps, nextProps) => {
    // Skip children comparison since React elements are always different references
    // Only compare the props that actually affect rendering
    return (
      prevProps.componentName === nextProps.componentName &&
      prevProps.componentType === nextProps.componentType &&
      prevProps.index === nextProps.index &&
      JSON.stringify(prevProps.componentProps) === JSON.stringify(nextProps.componentProps)
    );
  }
);