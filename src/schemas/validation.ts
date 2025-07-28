/**
 * Schema validation system for runtime data validation
 */

import {
  FieldSchema,
  DataShape,
  ValidationResult,
  FieldType,
  ComponentSchema,
  PageSchema,
  ApplicationSchema,
} from './types';

export class SchemaValidator {
  /**
   * Validate data against a DataShape schema
   */
  static validateData(data: any, shape: DataShape): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    try {
      this.validateDataShape(data, shape, '', errors, warnings);
    } catch (error) {
      errors.push({
        path: '',
        message: `Validation error: ${error.message}`,
        value: data,
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate a component schema
   */
  static validateComponentSchema(schema: ComponentSchema): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Check required fields
    if (!schema.id) {
      errors.push({ path: 'id', message: 'Component ID is required' });
    }
    if (!schema.name) {
      errors.push({ path: 'name', message: 'Component name is required' });
    }
    if (!schema.type) {
      errors.push({ path: 'type', message: 'Component type is required' });
    }

    // Validate props
    if (!Array.isArray(schema.props)) {
      errors.push({ path: 'props', message: 'Props must be an array' });
    } else {
      schema.props.forEach((prop, index) => {
        if (!prop.name) {
          errors.push({
            path: `props[${index}].name`,
            message: 'Prop name is required',
          });
        }
        if (!prop.type) {
          errors.push({
            path: `props[${index}].type`,
            message: 'Prop type is required',
          });
        }
      });
    }

    // Validate data shape if present
    if (schema.dataShape) {
      const shapeValidation = this.validateDataShapeSchema(schema.dataShape, 'dataShape');
      if (shapeValidation.errors) {
        errors.push(...shapeValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Transform and clean data to match schema
   */
  static transformData(data: any, shape: DataShape): any {
    if (shape.type === 'array') {
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map((item) =>
        shape.itemShape ? this.transformData(item, shape.itemShape) : item
      );
    }

    if (shape.type === 'object' && shape.fields) {
      const transformed: any = {};

      for (const [key, fieldSchema] of Object.entries(shape.fields)) {
        const value = data?.[key];

        if (value !== undefined) {
          transformed[key] = this.transformField(value, fieldSchema);
        } else if (fieldSchema.default !== undefined) {
          transformed[key] = fieldSchema.default;
        } else if (fieldSchema.required) {
          // Will be caught by validation
          transformed[key] = null;
        }
      }

      return transformed;
    }

    return data;
  }

  /**
   * Parse data with automatic type coercion
   */
  static parseData(data: any, shape: DataShape): any {
    const transformed = this.transformData(data, shape);
    const validation = this.validateData(transformed, shape);

    if (!validation.valid) {
      throw new Error(
        `Data validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`
      );
    }

    return transformed;
  }

  // Private helper methods

  private static validateDataShape(
    data: any,
    shape: DataShape,
    path: string,
    errors: ValidationResult['errors'],
    warnings: ValidationResult['warnings']
  ): void {
    if (shape.type === 'array') {
      if (!Array.isArray(data)) {
        errors.push({
          path,
          message: `Expected array but got ${typeof data}`,
          value: data,
        });
        return;
      }

      if (shape.itemShape) {
        data.forEach((item, index) => {
          this.validateDataShape(item, shape.itemShape!, `${path}[${index}]`, errors, warnings);
        });
      }
    } else if (shape.type === 'object') {
      if (typeof data !== 'object' || data === null) {
        errors.push({
          path,
          message: `Expected object but got ${typeof data}`,
          value: data,
        });
        return;
      }

      if (shape.fields) {
        // Check required fields
        if (shape.required) {
          for (const field of shape.required) {
            if (!(field in data)) {
              errors.push({
                path: `${path}.${field}`,
                message: `Required field missing`,
                value: undefined,
              });
            }
          }
        }

        // Validate each field
        for (const [key, fieldSchema] of Object.entries(shape.fields)) {
          const fieldPath = path ? `${path}.${key}` : key;
          const value = data[key];

          if (value !== undefined) {
            this.validateField(value, fieldSchema, fieldPath, errors, warnings);
          } else if (fieldSchema.required) {
            errors.push({
              path: fieldPath,
              message: `Required field missing`,
              value: undefined,
            });
          }
        }

        // Warn about extra fields
        for (const key of Object.keys(data)) {
          if (!(key in shape.fields)) {
            warnings.push({
              path: `${path}.${key}`,
              message: `Unknown field in data`,
            });
          }
        }
      }
    }
  }

  private static validateField(
    value: any,
    schema: FieldSchema,
    path: string,
    errors: ValidationResult['errors'],
    warnings: ValidationResult['warnings']
  ): void {
    // Type validation
    if (!this.validateFieldType(value, schema.type)) {
      errors.push({
        path,
        message: `Expected ${schema.type} but got ${typeof value}`,
        value,
      });
      return;
    }

    // String validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          path,
          message: `String length ${value.length} is less than minimum ${schema.minLength}`,
          value,
        });
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          path,
          message: `String length ${value.length} exceeds maximum ${schema.maxLength}`,
          value,
        });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({
          path,
          message: `String does not match pattern ${schema.pattern}`,
          value,
        });
      }
      if (schema.format && !this.validateFormat(value, schema.format)) {
        errors.push({
          path,
          message: `Invalid ${schema.format} format`,
          value,
        });
      }
    }

    // Number validations
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        errors.push({
          path,
          message: `Value ${value} is less than minimum ${schema.min}`,
          value,
        });
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push({
          path,
          message: `Value ${value} exceeds maximum ${schema.max}`,
          value,
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        value,
      });
    }

    // Array validations
    if (schema.type === 'array' && Array.isArray(value)) {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push({
          path,
          message: `Array length ${value.length} is less than minimum ${schema.minItems}`,
          value,
        });
      }
      if (schema.maxItems && value.length > schema.maxItems) {
        errors.push({
          path,
          message: `Array length ${value.length} exceeds maximum ${schema.maxItems}`,
          value,
        });
      }
      if (schema.itemType) {
        value.forEach((item, index) => {
          this.validateField(item, schema.itemType!, `${path}[${index}]`, errors, warnings);
        });
      }
    }

    // Object validations
    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (value[key] !== undefined) {
          this.validateField(value[key], propSchema, `${path}.${key}`, errors, warnings);
        }
      }
    }
  }

  private static validateFieldType(value: any, type: FieldType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  private static validateFormat(value: string, format: string): boolean {
    const patterns: Record<string, RegExp> = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      phone: /^\+?[\d\s-()]+$/,
      currency: /^\$?[\d,]+\.?\d*$/,
      percentage: /^\d+\.?\d*%?$/,
      datetime: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/,
    };

    return patterns[format]?.test(value) ?? true;
  }

  private static transformField(value: any, schema: FieldSchema): any {
    // Type coercion
    if (schema.type === 'number' && typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }

    if (schema.type === 'boolean' && typeof value === 'string') {
      return value === 'true' || value === '1';
    }

    if (schema.type === 'date' && typeof value === 'string') {
      return new Date(value);
    }

    if (schema.type === 'array' && !Array.isArray(value)) {
      return [value];
    }

    return value;
  }

  private static validateDataShapeSchema(shape: DataShape, path: string): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    if (!shape.type) {
      errors.push({
        path: `${path}.type`,
        message: 'DataShape type is required',
      });
    }

    if (shape.type === 'object' && !shape.fields) {
      errors.push({
        path: `${path}.fields`,
        message: 'Object shape must define fields',
      });
    }

    if (shape.type === 'array' && !shape.itemShape) {
      errors.push({
        path: `${path}.itemShape`,
        message: 'Array shape must define itemShape',
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

// Convenience functions
export function validateData(data: any, shape: DataShape): ValidationResult {
  return SchemaValidator.validateData(data, shape);
}

export function parseData<T = any>(data: any, shape: DataShape): T {
  return SchemaValidator.parseData(data, shape) as T;
}

export function validateComponentSchema(schema: ComponentSchema): ValidationResult {
  return SchemaValidator.validateComponentSchema(schema);
}
