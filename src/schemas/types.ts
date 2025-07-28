/**
 * Core schema types for component generation and configuration
 */

// Base field types
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export type FieldFormat = 'email' | 'url' | 'phone' | 'currency' | 'percentage' | 'datetime';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  format?: FieldFormat;
  enum?: string[] | number[];
  default?: any;
  description?: string;
  // For arrays
  itemType?: FieldSchema;
  minItems?: number;
  maxItems?: number;
  // For objects
  properties?: Record<string, FieldSchema>;
  // For numbers
  min?: number;
  max?: number;
  // For strings
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Data shape for components
export interface DataShape {
  type: 'object' | 'array' | 'primitive';
  fields?: Record<string, FieldSchema>;
  itemShape?: DataShape;
  required?: string[];
}

// Component prop schema
export interface PropSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'object' | 'function';
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  description?: string;
  group?: string;
}

// Variant schema
export interface VariantSchema {
  name: string;
  label: string;
  description?: string;
  props?: Record<string, any>;
  dataTransform?: string; // Function as string for serialization
}

// Component schema
export interface ComponentSchema {
  id: string;
  name: string;
  type: 'display' | 'form' | 'layout' | 'navigation' | 'utility';
  category?: string;
  description?: string;
  dataShape?: DataShape;
  props: PropSchema[];
  variants?: VariantSchema[];
  children?: ComponentSchema[];
  defaultProps?: Record<string, any>;
  // For code generation
  imports?: string[];
  dependencies?: string[];
}

// Data source schema
export interface DataSourceSchema {
  id: string;
  name?: string;
  type: 'rest' | 'graphql' | 'static' | 'computed';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  query?: string; // For GraphQL
  transform?: string; // Transform function as string
  cache?: {
    enabled: boolean;
    ttl?: number;
    key?: string;
  };
  refresh?: {
    interval?: number;
    events?: string[];
  };
  // Expected data shape
  responseShape?: DataShape;
}

// Component placement in layouts
export interface ComponentPlacement {
  id: string;
  component: string; // Component schema ID
  dataSource?: string; // Data source ID
  props?: Record<string, any>;
  gridArea?: string;
  order?: number;
  responsive?: {
    mobile?: Partial<ComponentPlacement>;
    tablet?: Partial<ComponentPlacement>;
    desktop?: Partial<ComponentPlacement>;
  };
}

// Layout types
export type LayoutType = 'grid' | 'flex' | 'absolute' | 'responsive';

// Page schema
export interface PageSchema {
  id: string;
  name: string;
  route: string;
  title?: string;
  description?: string;
  layout: {
    type: LayoutType;
    config?: Record<string, any>;
  };
  dataSources: DataSourceSchema[];
  components: ComponentPlacement[];
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
    tags?: string[];
  };
}

// Application schema
export interface ApplicationSchema {
  id: string;
  name: string;
  version: string;
  description?: string;
  pages: PageSchema[];
  components: ComponentSchema[];
  globalDataSources?: DataSourceSchema[];
  theme?: Record<string, any>;
  routing?: {
    type: 'hash' | 'browser';
    basename?: string;
  };
  features?: {
    authentication?: boolean;
    analytics?: boolean;
    errorBoundary?: boolean;
  };
}

// Schema validation result
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    value?: any;
  }>;
  warnings?: Array<{
    path: string;
    message: string;
  }>;
}

// Runtime configuration
export interface RuntimeConfig {
  apiBaseUrl?: string;
  environment?: 'development' | 'staging' | 'production';
  features?: Record<string, boolean>;
  debug?: boolean;
}
