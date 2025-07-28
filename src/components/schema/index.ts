/**
 * Schema-based components
 */

export { ConfigurableComponent, withSchemaConfig } from './ConfigurableComponent';
export type { ConfigurableComponentProps } from './ConfigurableComponent';

export { SchemaDataDisplay, SchemaDataDisplaySchema } from './SchemaDataDisplay';

// Re-export schema types for convenience
export type {
  ComponentSchema,
  DataShape,
  DataSourceSchema,
  PageSchema,
  ApplicationSchema,
} from '../../schemas/types';
