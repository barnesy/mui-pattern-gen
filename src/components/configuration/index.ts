/**
 * Unified Configuration Panel exports
 * 
 * This module provides a unified approach to configuration/props editing
 * that consolidates the functionality from:
 * - PatternPropsPanel
 * - SchemaPropsForm  
 * - PurePropsForm
 * - AIDesignModeDrawer prop editing
 */

// Main components
export { 
  ConfigurationPanel, 
  MemoizedConfigurationPanel,
  useConfigurationPanel 
} from './ConfigurationPanel';

// Configuration Mode components
export { ConfigurationModeDrawer } from './ConfigurationModeDrawer';
export { ConfigurationModeOverlay } from './ConfigurationModeOverlay';
export { ConfigurationModeToggle } from './ConfigurationModeToggle';
export { PatternWrapper } from './PatternWrapper';
export { SubComponentWrapper } from './SubComponentWrapper';

// Component types
export type { PatternWrapperProps } from './PatternWrapper';
export type { SubComponentWrapperProps } from './SubComponentWrapper';

// Types
export type {
  ConfigurationPanelProps,
  ConfigurationState,
  ConfigControl,
  ControlGroup,
  UpdateMode,
  UseConfigurationPanelReturn,
  ControlType,
  ConfigSource,
  ControlRendererProps,
  SchemaToControlsOptions,
  ControlFactoryOptions,
  ConfigurationChangeEvent,
  MigrationHelpers,
} from './types';

// Utilities
export {
  convertSchemaToControls,
  extractDefaultValues,
  validateControlValues,
  groupControls,
  migrationHelpers,
  deepEqual,
  debounce,
  generateControlId,
  formatValidationError,
  isEmpty,
  mergeConfigurations,
  sortControls,
} from './utils';

// Validation utilities
export {
  ValidationPatterns,
  ValidationFunctions,
  ValidationPresets,
  validateField,
  validateForm,
  createValidationFromSchema,
  applyValidationPreset,
  applyValidationPresets,
} from './validation';

// Re-export commonly used types from dependencies
export type { SpacingConfig } from '../../types/PatternVariant';
export type { ComponentSchema, PropSchema } from '../../schemas/types';