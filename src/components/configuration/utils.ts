/**
 * Utility functions for the ConfigurationPanel component
 */

import { ComponentSchema } from '../../schemas/types';
import { 
  ConfigControl, 
  MigrationHelpers,
  SchemaToControlsOptions,
  ConfigValue
} from './types';

/**
 * Convert ComponentSchema props to ConfigControl array
 */
export function convertSchemaToControls(
  schema: ComponentSchema, 
  options: SchemaToControlsOptions = {}
): ConfigControl[] {
  const {
    includeGroups = true,
    defaultGroup = 'General',
    excludeTypes = [],
    customMappings = {},
  } = options;

  return schema.props
    .filter(prop => !excludeTypes.includes(prop.type))
    .map(prop => {
      const baseControl: ConfigControl = {
        name: prop.name,
        type: mapSchemaTypeToControlType(prop.type),
        label: prop.name.charAt(0).toUpperCase() + prop.name.slice(1),
        required: prop.required,
        defaultValue: prop.default as ConfigValue,
        options: prop.options as { label: string; value: string | number | boolean }[] | undefined,
        description: prop.description,
        group: includeGroups ? (prop.group ?? defaultGroup) : undefined,
      };

      // Apply custom mappings
      const customMapping = customMappings[prop.name];
      if (customMapping) {
        return { ...baseControl, ...customMapping };
      }

      return baseControl;
    });
}

/**
 * Map schema prop types to control types
 */
function mapSchemaTypeToControlType(schemaType: string): ConfigControl['type'] {
  switch (schemaType) {
    case 'string': return 'text';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'enum': return 'select';
    case 'object': return 'spacing'; // Default assumption, should be customized
    default: return 'text';
  }
}

/**
 * Extract default values from controls
 */
export function extractDefaultValues(controls: ConfigControl[]): Record<string, ConfigValue> {
  const defaults: Record<string, ConfigValue> = {};
  
  controls.forEach(control => {
    if (control.defaultValue !== undefined) {
      defaults[control.name] = control.defaultValue;
    }
  });

  return defaults;
}

/**
 * Validate a set of values against controls
 */
export function validateControlValues(
  values: Record<string, ConfigValue>,
  controls: ConfigControl[]
): { errors: Record<string, string>; isValid: boolean } {
  const errors: Record<string, string> = {};

  controls.forEach(control => {
    const value = values[control.name];

    // Required validation
    if (control.required && (value === undefined || value === null || value === '')) {
      errors[control.name] = `${control.label} is required`;
      return;
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Custom validation
    if (control.validation?.custom) {
      const error = control.validation.custom(value);
      if (error) {
        errors[control.name] = error;
        return;
      }
    }

    // Pattern validation for strings
    if (control.type === 'text' && control.validation?.pattern && typeof value === 'string') {
      const pattern = typeof control.validation.pattern === 'string' 
        ? new RegExp(control.validation.pattern) 
        : control.validation.pattern;
      if (!pattern.test(value)) {
        errors[control.name] = `${control.label} format is invalid`;
        return;
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (control.validation?.minLength && value.length < control.validation.minLength) {
        errors[control.name] = `${control.label} must be at least ${control.validation.minLength} characters`;
        return;
      }
      if (control.validation?.maxLength && value.length > control.validation.maxLength) {
        errors[control.name] = `${control.label} must be no more than ${control.validation.maxLength} characters`;
        return;
      }
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (control.min !== undefined && value < control.min) {
        errors[control.name] = `${control.label} must be at least ${control.min}`;
        return;
      }
      if (control.max !== undefined && value > control.max) {
        errors[control.name] = `${control.label} must be no more than ${control.max}`;
        return;
      }
    }

    // Options validation for select/variant controls
    if ((control.type === 'select' || control.type === 'variant') && control.options) {
      const validValues = control.options.map(opt => opt.value);
      if (!validValues.includes(value)) {
        errors[control.name] = `${control.label} must be one of: ${validValues.join(', ')}`;
        return;
      }
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Group controls by their group property
 */
export function groupControls(controls: ConfigControl[]): Record<string, ConfigControl[]> {
  const groups: Record<string, ConfigControl[]> = {};

  controls.forEach(control => {
    const groupName = control.group ?? 'General';
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(control);
  });

  return groups;
}

// Type for legacy PatternPropsPanel controls
interface LegacyPatternControl {
  name: string;
  type: string;
  label: string;
  defaultValue?: unknown;
  options?: unknown;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  group?: string;
  isContent?: boolean;
  isComponent?: boolean;
  componentGroup?: string;
  sides?: unknown;
  unit?: string;
}

/**
 * Convert PatternPropsPanel controls to ConfigurationPanel format
 */
function _convertPatternPropsControls(controls: LegacyPatternControl[]): ConfigControl[] {
  return controls.map(control => ({
    name: control.name,
    type: control.type as ConfigControl['type'],
    label: control.label,
    defaultValue: control.defaultValue as ConfigValue,
    options: control.options as { label: string; value: string | number | boolean }[] | undefined,
    min: control.min,
    max: control.max,
    step: control.step,
    helperText: control.helperText,
    group: control.group,
    isContent: control.isContent,
    isComponent: control.isComponent,
    componentGroup: control.componentGroup,
    sides: control.sides as ('top' | 'right' | 'bottom' | 'left')[] | undefined,
    unit: control.unit as 'px' | '%' | undefined,
  }));
}

/**
 * Migration helpers for backward compatibility
 */
export const migrationHelpers: MigrationHelpers = {
  fromPatternPropsPanel: (controls: ConfigControl[], values: Record<string, ConfigValue>) => ({
    source: {
      type: 'controls',
      controls: controls,
    },
    values,
    onChange: () => {}, // To be provided by consumer
    updateMode: 'batched',
    showGroupedAccordions: false,
  }),

  fromSchemaPropsForm: (schema: ComponentSchema, values: Record<string, ConfigValue>) => ({
    source: {
      type: 'schema',
      schema,
    },
    values,
    onChange: () => {}, // To be provided by consumer
    updateMode: 'batched',
    showGroupedAccordions: true,
    enableValidation: true,
  }),

  fromPurePropsForm: (schema: ComponentSchema, values: Record<string, ConfigValue>) => ({
    source: {
      type: 'schema',
      schema,
    },
    values,
    onChange: () => {}, // To be provided by consumer
    updateMode: 'explicit',
    showGroupedAccordions: true,
    enableValidation: true,
  }),
};

/**
 * Deep comparison utility for props
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {return true;}
  if (a === null || a === undefined || b === null || b === undefined) {return false;}
  if (typeof a !== typeof b) {return false;}

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    
    if (keysA.length !== keysB.length) {return false;}
    
    return keysA.every(key => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }

  return false;
}

/**
 * Debounce utility for input changes
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Generate a unique ID for control instances
 */
export function generateControlId(prefix: string = 'control'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format validation error messages
 */
export function formatValidationError(error: string, fieldLabel: string): string {
  return error.replace(/\{field\}/g, fieldLabel);
}

/**
 * Check if a value is empty for validation purposes
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {return true;}
  if (typeof value === 'string') {return value.trim() === '';}
  if (Array.isArray(value)) {return value.length === 0;}
  if (typeof value === 'object') {return Object.keys(value).length === 0;}
  return false;
}

/**
 * Merge configurations for extending controls
 */
export function mergeConfigurations(
  base: ConfigControl[],
  override: Partial<ConfigControl>[]
): ConfigControl[] {
  const result = [...base];
  
  override.forEach(overrideControl => {
    const index = result.findIndex(control => control.name === overrideControl.name);
    if (index >= 0 && overrideControl.name) {
      result[index] = { ...result[index], ...overrideControl };
    } else if (overrideControl.name) {
      // Add new control if name is provided
      result.push(overrideControl as ConfigControl);
    }
  });

  return result;
}

/**
 * Sort controls by group and then by order or name
 */
export function sortControls(controls: ConfigControl[]): ConfigControl[] {
  return [...controls].sort((a, b) => {
    // Sort by group first
    const groupA = a.group ?? 'zzz'; // Put ungrouped items last
    const groupB = b.group ?? 'zzz';
    
    if (groupA !== groupB) {
      // Special ordering for common groups
      const groupOrder = ['General', 'Content', 'Appearance', 'Layout', 'Components', 'Advanced'];
      const indexA = groupOrder.indexOf(groupA);
      const indexB = groupOrder.indexOf(groupB);
      
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      } else if (indexA >= 0) {
        return -1;
      } else if (indexB >= 0) {
        return 1;
      } else {
        return groupA.localeCompare(groupB);
      }
    }

    // Within same group, sort by name
    return a.label.localeCompare(b.label);
  });
}