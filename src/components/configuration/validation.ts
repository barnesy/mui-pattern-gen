/**
 * Validation utilities for ConfigurationPanel
 * Provides schema-based and custom validation support
 */

import { ComponentSchema, ValidationResult } from '../../schemas/types';
import { ConfigControl } from './types';

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_]+$/,
  cssIdentifier: /^[a-zA-Z][\w\-]*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  cssUnit: /^\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|lh)$/,
} as const;

/**
 * Built-in validation functions
 */
export const ValidationFunctions = {
  required: (value: any, label: string): string | null => {
    if (value === undefined || value === null || value === '') {
      return `${label} is required`;
    }
    return null;
  },

  email: (value: string, label: string): string | null => {
    if (value && !ValidationPatterns.email.test(value)) {
      return `${label} must be a valid email address`;
    }
    return null;
  },

  url: (value: string, label: string): string | null => {
    if (value && !ValidationPatterns.url.test(value)) {
      return `${label} must be a valid URL starting with http:// or https://`;
    }
    return null;
  },

  phone: (value: string, label: string): string | null => {
    if (value && !ValidationPatterns.phone.test(value)) {
      return `${label} must be a valid phone number`;
    }
    return null;
  },

  minLength: (min: number) => (value: string, label: string): string | null => {
    if (value && value.length < min) {
      return `${label} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string, label: string): string | null => {
    if (value && value.length > max) {
      return `${label} must be no more than ${max} characters long`;
    }
    return null;
  },

  min: (min: number) => (value: number, label: string): string | null => {
    if (typeof value === 'number' && value < min) {
      return `${label} must be at least ${min}`;
    }
    return null;
  },

  max: (max: number) => (value: number, label: string): string | null => {
    if (typeof value === 'number' && value > max) {
      return `${label} must be no more than ${max}`;
    }
    return null;
  },

  range: (min: number, max: number) => (value: number, label: string): string | null => {
    if (typeof value === 'number') {
      if (value < min) {
        return `${label} must be at least ${min}`;
      }
      if (value > max) {
        return `${label} must be no more than ${max}`;
      }
    }
    return null;
  },

  pattern: (pattern: RegExp, message?: string) => (value: string, label: string): string | null => {
    if (value && !pattern.test(value)) {
      return message || `${label} format is invalid`;
    }
    return null;
  },

  oneOf: (options: any[]) => (value: any, label: string): string | null => {
    if (value !== undefined && value !== null && !options.includes(value)) {
      return `${label} must be one of: ${options.join(', ')}`;
    }
    return null;
  },

  hexColor: (value: string, label: string): string | null => {
    if (value && !ValidationPatterns.hexColor.test(value)) {
      return `${label} must be a valid hex color (e.g., #ff0000 or #f00)`;
    }
    return null;
  },

  cssUnit: (value: string, label: string): string | null => {
    if (value && !ValidationPatterns.cssUnit.test(value)) {
      return `${label} must be a valid CSS unit (e.g., 10px, 1em, 100%)`;
    }
    return null;
  },

  positiveNumber: (value: number, label: string): string | null => {
    if (typeof value === 'number' && value <= 0) {
      return `${label} must be a positive number`;
    }
    return null;
  },

  integer: (value: number, label: string): string | null => {
    if (typeof value === 'number' && !Number.isInteger(value)) {
      return `${label} must be a whole number`;
    }
    return null;
  },
} as const;

/**
 * Validate a single field against a control definition
 */
export function validateField(
  value: any,
  control: ConfigControl
): string | null {
  const { label, required, validation } = control;

  // Required validation
  if (required && ValidationFunctions.required(value, label)) {
    return ValidationFunctions.required(value, label);
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Custom validation function
  if (validation?.custom) {
    const customError = validation.custom(value);
    if (customError) {
      return customError;
    }
  }

  // Pattern validation
  if (validation?.pattern && typeof value === 'string') {
    const pattern = typeof validation.pattern === 'string' 
      ? new RegExp(validation.pattern) 
      : validation.pattern;
    const error = ValidationFunctions.pattern(pattern)(value, label);
    if (error) return error;
  }

  // Length validations for strings
  if (typeof value === 'string') {
    if (validation?.minLength) {
      const error = ValidationFunctions.minLength(validation.minLength)(value, label);
      if (error) return error;
    }
    if (validation?.maxLength) {
      const error = ValidationFunctions.maxLength(validation.maxLength)(value, label);
      if (error) return error;
    }
  }

  // Range validations for numbers
  if (typeof value === 'number') {
    if (control.min !== undefined) {
      const error = ValidationFunctions.min(control.min)(value, label);
      if (error) return error;
    }
    if (control.max !== undefined) {
      const error = ValidationFunctions.max(control.max)(value, label);
      if (error) return error;
    }
  }

  // Options validation for select/variant controls
  if ((control.type === 'select' || control.type === 'variant') && control.options) {
    const validValues = control.options.map(opt => opt.value);
    const error = ValidationFunctions.oneOf(validValues)(value, label);
    if (error) return error;
  }

  return null;
}

/**
 * Validate all fields in a form
 */
export function validateForm(
  values: Record<string, any>,
  controls: ConfigControl[]
): { errors: Record<string, string>; isValid: boolean } {
  const errors: Record<string, string> = {};

  controls.forEach(control => {
    const value = values[control.name];
    const error = validateField(value, control);
    if (error) {
      errors[control.name] = error;
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Create validation rules from schema
 */
export function createValidationFromSchema(schema: ComponentSchema): ConfigControl[] {
  return schema.props.map(prop => {
    const control: ConfigControl = {
      name: prop.name,
      type: mapSchemaTypeToControlType(prop.type),
      label: prop.name.charAt(0).toUpperCase() + prop.name.slice(1),
      required: prop.required,
      defaultValue: prop.default,
      options: prop.options,
      description: prop.description,
      group: prop.group,
    };

    // Add built-in validations based on prop type
    if (prop.type === 'string') {
      // Add common string validations
      if (prop.name.toLowerCase().includes('email')) {
        control.validation = {
          custom: (value: string) => ValidationFunctions.email(value, control.label),
        };
      } else if (prop.name.toLowerCase().includes('url')) {
        control.validation = {
          custom: (value: string) => ValidationFunctions.url(value, control.label),
        };
      } else if (prop.name.toLowerCase().includes('phone')) {
        control.validation = {
          custom: (value: string) => ValidationFunctions.phone(value, control.label),
        };
      } else if (prop.name.toLowerCase().includes('color')) {
        control.validation = {
          custom: (value: string) => ValidationFunctions.hexColor(value, control.label),
        };
      }
    }

    return control;
  });
}

/**
 * Helper to map schema types to control types
 */
function mapSchemaTypeToControlType(schemaType: string): ConfigControl['type'] {
  switch (schemaType) {
    case 'string': return 'text';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'enum': return 'select';
    case 'object': return 'spacing';
    default: return 'text';
  }
}

/**
 * Validation preset configurations
 */
export const ValidationPresets = {
  name: {
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      pattern: ValidationPatterns.noSpecialChars,
    },
  },
  
  email: {
    required: true,
    validation: {
      custom: (value: string) => ValidationFunctions.email(value, 'Email'),
    },
  },
  
  url: {
    validation: {
      custom: (value: string) => ValidationFunctions.url(value, 'URL'),
    },
  },
  
  positiveInteger: {
    validation: {
      custom: (value: number) => {
        const positiveError = ValidationFunctions.positiveNumber(value, 'Value');
        if (positiveError) return positiveError;
        return ValidationFunctions.integer(value, 'Value');
      },
    },
  },
  
  cssIdentifier: {
    validation: {
      pattern: ValidationPatterns.cssIdentifier,
    },
  },
  
  hexColor: {
    validation: {
      custom: (value: string) => ValidationFunctions.hexColor(value, 'Color'),
    },
  },
} as const;

/**
 * Apply validation preset to a control
 */
export function applyValidationPreset(
  control: ConfigControl,
  preset: keyof typeof ValidationPresets
): ConfigControl {
  const presetConfig = ValidationPresets[preset];
  return {
    ...control,
    ...presetConfig,
  };
}

/**
 * Batch apply validation presets
 */
export function applyValidationPresets(
  controls: ConfigControl[],
  presets: Record<string, keyof typeof ValidationPresets>
): ConfigControl[] {
  return controls.map(control => {
    const preset = presets[control.name];
    return preset ? applyValidationPreset(control, preset) : control;
  });
}