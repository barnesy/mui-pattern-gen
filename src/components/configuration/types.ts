/**
 * Unified types for the ConfigurationPanel component
 * Consolidates types from PatternPropsPanel, SchemaPropsForm, and other prop editing implementations
 */

import { SpacingConfig } from '../../types/PatternVariant';
import { UnknownObject } from '../../types/common';
import { ComponentSchema, PropSchema, ValidationResult } from '../../schemas/types';

// Base control types - supports all existing control types from PatternPropsPanel
export type ControlType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'slider'
  | 'variant'
  | 'spacing'
  | 'size'
  | 'padding'
  | 'margin'
  | 'typography';

// Configuration control definition - extends PatternPropsPanel.PropControl
export interface ConfigControl {
  name: string;
  type: ControlType;
  label: string;
  defaultValue?: string | number | boolean | SpacingConfig | UnknownObject;
  options?: { label: string; value: string | number | boolean }[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  group?: string;
  
  // Pattern-specific properties
  isContent?: boolean; // Mark text/number fields as content vs settings
  isComponent?: boolean; // Mark boolean fields as component toggles
  componentGroup?: string; // Group related component controls
  
  // Spacing control properties
  sides?: ('top' | 'right' | 'bottom' | 'left')[]; // For spacing controls
  unit?: 'px' | '%'; // For size controls
  
  // Schema-based properties
  required?: boolean;
  description?: string;
  
  // Validation properties
  validation?: {
    pattern?: string | RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null; // Return error message or null
  };
}

// Configuration source - can be from schema or direct controls
export type ConfigSource = 
  | { type: 'controls'; controls: ConfigControl[] }
  | { type: 'schema'; schema: ComponentSchema };

// Update mode - determines when changes are applied
export type UpdateMode = 
  | 'immediate' // Changes applied immediately (for sub-components)
  | 'batched'   // Changes applied on Update button click (for patterns)
  | 'explicit'; // Changes applied on explicit save action (for design mode)

// Configuration panel props
export interface ConfigurationPanelProps {
  // Configuration source
  source: ConfigSource;
  
  // Current values
  values: Record<string, any>;
  
  // Change handler
  onChange: (name: string, value: any) => void;
  
  // Update mode
  updateMode?: UpdateMode;
  
  // Action handlers (for batched/explicit modes)
  onSave?: (values: Record<string, any>) => void;
  onCancel?: () => void;
  onReset?: () => void;
  
  // UI customization
  title?: string;
  hideActions?: boolean;
  showGroupedAccordions?: boolean;
  compactMode?: boolean;
  
  // Validation
  enableValidation?: boolean;
  onValidationChange?: (errors: Record<string, string>, isValid: boolean) => void;
  
  // Additional metadata
  instanceId?: string;
  componentType?: string;
  
  // Advanced features
  enableSearch?: boolean;
  enableApplyToAll?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableUndoRedo?: boolean;
  showPreview?: boolean;
  onApplyToAll?: (values: Record<string, any>) => void;
  onPreviewChange?: (values: Record<string, any>) => void;
}

// Internal state for the configuration panel
export interface ConfigurationState {
  localValues: Record<string, any>;
  originalValues: Record<string, any>;
  hasChanges: boolean;
  errors: Record<string, string>;
  isValid: boolean;
  expandedGroups: Set<string>;
  searchQuery: string;
  filteredControls: ConfigControl[];
  undoStack: Record<string, any>[];
  redoStack: Record<string, any>[];
  canUndo: boolean;
  canRedo: boolean;
}

// Control renderer props
export interface ControlRendererProps {
  control: ConfigControl;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
}

// Group definition for organizing controls
export interface ControlGroup {
  name: string;
  label: string;
  controls: ConfigControl[];
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

// Hook return type for useConfigurationPanel
export interface UseConfigurationPanelReturn {
  state: ConfigurationState;
  actions: {
    handleChange: (name: string, value: any) => void;
    handleSave: () => void;
    handleCancel: () => void;
    handleReset: () => void;
    toggleGroup: (groupName: string) => void;
    validateField: (name: string, value: any) => string | null;
    validateAll: () => boolean;
    handleSearch: (query: string) => void;
    clearSearch: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleApplyToAll: () => void;
  };
  groups: ControlGroup[];
  controls: ConfigControl[];
  filteredGroups: ControlGroup[];
}

// Utility type for converting schema props to controls
export type SchemaToControlsOptions = {
  includeGroups?: boolean;
  defaultGroup?: string;
  excludeTypes?: string[];
  customMappings?: Record<string, Partial<ConfigControl>>;
};

// Control factory options
export interface ControlFactoryOptions {
  theme?: any;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  customRenderers?: Record<string, React.ComponentType<ControlRendererProps>>;
}

// Event types for configuration changes
export interface ConfigurationChangeEvent {
  type: 'change' | 'save' | 'cancel' | 'reset';
  name?: string;
  value?: any;
  values?: Record<string, any>;
  errors?: Record<string, string>;
  isValid?: boolean;
  source: 'user' | 'programmatic';
}

// Migration helpers for backward compatibility
export interface MigrationHelpers {
  fromPatternPropsPanel: (controls: any[], values: Record<string, any>) => ConfigurationPanelProps;
  fromSchemaPropsForm: (schema: ComponentSchema, values: Record<string, any>) => ConfigurationPanelProps;
  fromPurePropsForm: (schema: ComponentSchema, values: Record<string, any>) => ConfigurationPanelProps;
}