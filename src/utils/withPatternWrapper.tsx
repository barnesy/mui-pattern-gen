import React from 'react';
import { PatternWrapper } from '../components/AIDesignMode/PatternWrapper';

export interface WithPatternWrapperOptions {
  patternName: string;
  status: 'pending' | 'accepted';
  category: string;
}

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
        <Component {...props} ref={ref} />
      </PatternWrapper>
    );
  });

  WrappedComponent.displayName = `WithPatternWrapper(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}