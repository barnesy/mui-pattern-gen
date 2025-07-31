/**
 * AI Design Mode Components - Legacy exports
 * 
 * @deprecated These components have been refactored to Configuration Mode.
 * Please use components from '../configuration' instead.
 */

// Legacy exports for backwards compatibility
export { AIDesignModeDrawer } from './AIDesignModeDrawer';
export { AIDesignModeOverlay } from './AIDesignModeOverlay';
export { AIDesignModeToggle } from './AIDesignModeToggle';
export { PatternWrapper } from './PatternWrapper';
export { SubComponentWrapper } from './SubComponentWrapper';

// Re-export from configuration for gradual migration
export { 
  ConfigurationModeDrawer as ConfigurationDrawer,
  ConfigurationModeOverlay as ConfigurationOverlay,
  ConfigurationModeToggle as ConfigurationToggle,
  PatternWrapper as ConfigurationPatternWrapper,
  SubComponentWrapper as ConfigurationSubComponentWrapper,
} from '../configuration';

// Controls and configs
export { SizeControl } from './SizeControl';
export { SpacingControl } from './SpacingControl';
export { getSubComponentConfig } from './subComponentConfigs';

// Types
export type { SubComponentWrapperProps } from './SubComponentWrapper';
export type { PatternWrapperProps } from './PatternWrapper';