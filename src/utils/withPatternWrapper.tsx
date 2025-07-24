import React from 'react';
import { PatternWrapper } from '../components/AIDesignMode/PatternWrapper';
import { usePatternProps } from '../contexts/PatternPropsContext';

export interface WithPatternWrapperOptions {
  patternName: string;
  status: 'pending' | 'accepted';
  category: string;
}

/**
 * Component that uses pattern props from context
 * This ensures props are properly injected without cloning issues
 */
const PatternPropsInjector = React.forwardRef<any, {
  Component: React.ComponentType<any>;
  fallbackProps: any;
}>(({ Component, fallbackProps }, ref) => {
  const patternContext = usePatternProps();
  
  // Use context props if available, otherwise use fallback
  const props = patternContext ? patternContext.props : fallbackProps;
  
  
  return <Component {...props} ref={ref} />;
});

PatternPropsInjector.displayName = 'PatternPropsInjector';

/**
 * Higher-order component that wraps patterns with the PatternWrapper
 * This enables AI Design Mode detection for the pattern
 */
export function withPatternWrapper<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  options: WithPatternWrapperOptions
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <PatternWrapper
        patternName={options.patternName}
        status={options.status}
        category={options.category}
        patternProps={props}
      >
        <PatternPropsInjector Component={Component} fallbackProps={props} ref={ref} />
      </PatternWrapper>
    );
  });

  WrappedComponent.displayName = `WithPatternWrapper(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}