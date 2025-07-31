/**
 * Prototype types for managing generated UI configurations from schemas
 */

import { ComponentSchema, DataSourceSchema, ApplicationSchema } from '../schemas/types';

/**
 * Prototype status indicating its lifecycle stage
 */
export type PrototypeStatus = 'draft' | 'active' | 'archived' | 'shared';

/**
 * Schema type that a prototype can be based on
 */
export type SchemaType = 'component' | 'dbml' | 'application' | 'custom';

/**
 * Prototype metadata for tracking and organization
 */
export interface PrototypeMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
  author?: string;
  status: PrototypeStatus;
  category?: string;
  isPublic?: boolean;
  forkOf?: string; // ID of original prototype if this is a fork
  viewCount?: number;
  lastViewedAt?: Date;
}

/**
 * Base interface for all prototype schemas
 */
export interface BasePrototypeSchema {
  type: SchemaType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/**
 * Component schema for prototypes
 */
export interface ComponentPrototypeSchema extends BasePrototypeSchema {
  type: 'component';
  data: ComponentSchema;
}

/**
 * DBML schema for prototypes  
 */
export interface DBMLPrototypeSchema extends BasePrototypeSchema {
  type: 'dbml';
  data: {
    dbml: string;
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        constraints?: string[];
      }>;
    }>;
  };
}

/**
 * Application schema for prototypes
 */
export interface ApplicationPrototypeSchema extends BasePrototypeSchema {
  type: 'application';
  data: ApplicationSchema;
}

/**
 * Custom schema for prototypes
 */
export interface CustomPrototypeSchema extends BasePrototypeSchema {
  type: 'custom';
  data: Record<string, unknown>;
}

/**
 * Union type for all supported schema types
 */
export type PrototypeSchema = 
  | ComponentPrototypeSchema 
  | DBMLPrototypeSchema 
  | ApplicationPrototypeSchema 
  | CustomPrototypeSchema;

/**
 * Prototype configuration containing all customizable aspects
 */
export interface PrototypeConfiguration {
  // Theme configuration
  theme?: {
    mode: 'light' | 'dark';
    primaryColor?: string;
    secondaryColor?: string;
    customPalette?: Record<string, string>;
    typography?: Record<string, unknown>;
    spacing?: number;
    borderRadius?: number;
  };
  
  // Layout configuration
  layout?: {
    breakpoints?: Record<string, number>;
    containerMaxWidth?: string;
    gridSpacing?: number;
    padding?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
  };
  
  // Component-specific configuration
  components?: Record<string, unknown>;
  
  // Data configuration
  dataSources?: DataSourceSchema[];
  
  // Responsive configuration
  responsive?: {
    mobile?: Partial<PrototypeConfiguration>;
    tablet?: Partial<PrototypeConfiguration>;
    desktop?: Partial<PrototypeConfiguration>;
  };
  
  // Custom properties
  custom?: Record<string, unknown>;
}

/**
 * Main prototype interface
 */
export interface Prototype {
  id: string;
  name: string;
  description?: string;
  schema: PrototypeSchema;
  configuration: PrototypeConfiguration;
  metadata: PrototypeMetadata;
  
  // Runtime data (not persisted)
  _runtime?: {
    isLoading?: boolean;
    lastError?: Error;
    isDirty?: boolean;
  };
}

/**
 * Prototype creation input
 */
export interface CreatePrototypeInput {
  name: string;
  description?: string;
  schema: PrototypeSchema;
  configuration?: Partial<PrototypeConfiguration>;
  metadata?: Partial<PrototypeMetadata>;
}

/**
 * Prototype update input
 */
export interface UpdatePrototypeInput {
  name?: string;
  description?: string;
  schema?: PrototypeSchema;
  configuration?: Partial<PrototypeConfiguration>;
  metadata?: Partial<PrototypeMetadata>;
}

/**
 * Prototype query filters
 */
export interface PrototypeQueryFilters {
  status?: PrototypeStatus[];
  schemaType?: SchemaType[];
  tags?: string[];
  author?: string;
  category?: string;
  isPublic?: boolean;
  search?: string; // Search in name and description
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

/**
 * Prototype sort options
 */
export interface PrototypeSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'viewCount';
  direction: 'asc' | 'desc';
}

/**
 * Prototype query options
 */
export interface PrototypeQueryOptions {
  filters?: PrototypeQueryFilters;
  sort?: PrototypeSortOptions;
  limit?: number;
  offset?: number;
}

/**
 * Prototype query result
 */
export interface PrototypeQueryResult {
  prototypes: Prototype[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

/**
 * Prototype export format
 */
export interface PrototypeExport {
  version: string;
  exportedAt: Date;
  prototypes: Prototype[];
  metadata?: {
    source?: string;
    generator?: string;
    notes?: string;
  };
}

/**
 * Prototype import result
 */
export interface PrototypeImportResult {
  imported: number;
  skipped: number;
  errors: Array<{
    prototype: string;
    error: string;
  }>;
  prototypes: Prototype[];
}

/**
 * Prototype events
 */
export interface PrototypeEvents {
  'prototype:created': { prototype: Prototype };
  'prototype:updated': { prototype: Prototype; changes: Partial<Prototype> };
  'prototype:deleted': { id: string };
  'prototype:viewed': { id: string; viewCount: number };
  'prototype:forked': { original: Prototype; fork: Prototype };
  'prototypes:imported': { result: PrototypeImportResult };
  'prototypes:exported': { prototypes: Prototype[]; format: string };
}

/**
 * Prototype service configuration
 */
export interface PrototypeServiceConfig {
  database?: {
    name?: string;
    version?: number;
    maxSize?: number; // in MB
  };
  cache?: {
    enabled?: boolean;
    maxAge?: number; // in ms
    maxSize?: number; // max number of items
  };
  autoSave?: {
    enabled?: boolean;
    interval?: number; // in ms
    maxVersions?: number;
  };
  export?: {
    includeMetadata?: boolean;
    compressLarge?: boolean;
    maxFileSize?: number; // in MB
  };
}

/**
 * Validation result for prototype data
 */
export interface PrototypeValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}