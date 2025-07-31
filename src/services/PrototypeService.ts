/**
 * Prototype Service - Main service layer for prototype management
 * Provides CRUD operations, search, filtering, and event management
 */

import {
  Prototype,
  CreatePrototypeInput,
  UpdatePrototypeInput,
  PrototypeQueryFilters,
  PrototypeSortOptions,
  PrototypeQueryResult,
  PrototypeExport,
  PrototypeImportResult,
  PrototypeEvents,
  PrototypeServiceConfig,
  PrototypeValidationResult
} from '../types/prototype';

import {
  initDB,
  createPrototype as dbCreatePrototype,
  getPrototype as dbGetPrototype,
  updatePrototype as dbUpdatePrototype,
  deletePrototype as dbDeletePrototype,
  queryPrototypes as dbQueryPrototypes,
  getAllPrototypes as dbGetAllPrototypes,
  getDBStats,
  cleanupDB,
  closeDB
} from './db/prototypeDB';

/**
 * Browser-compatible event emitter for prototype events
 */
class PrototypeEventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private events: Map<keyof PrototypeEvents, Set<(data: any) => void>> = new Map();

  on<K extends keyof PrototypeEvents>(event: K, handler: (data: PrototypeEvents[K]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  off<K extends keyof PrototypeEvents>(event: K, handler: (data: PrototypeEvents[K]) => void): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<K extends keyof PrototypeEvents>(event: K, data: PrototypeEvents[K]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}

/**
 * Main Prototype Service Class
 */
class PrototypeServiceClass extends PrototypeEventEmitter {
  private static instance: PrototypeServiceClass;
  private config: PrototypeServiceConfig;
  private cache: Map<string, { prototype: Prototype; timestamp: number }> = new Map();
  private isInitialized = false;

  private constructor(config: PrototypeServiceConfig = {}) {
    super();
    this.config = {
      database: {
        name: 'PrototypeDB',
        version: 1,
        maxSize: 50, // 50MB
        ...config.database
      },
      cache: {
        enabled: true,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxSize: 100, // max 100 cached items
        ...config.cache
      },
      autoSave: {
        enabled: true,
        interval: 30 * 1000, // 30 seconds
        maxVersions: 10,
        ...config.autoSave
      },
      export: {
        includeMetadata: true,
        compressLarge: true,
        maxFileSize: 10, // 10MB
        ...config.export
      }
    };
  }

  static getInstance(config?: PrototypeServiceConfig): PrototypeServiceClass {
    if (!PrototypeServiceClass.instance) {
      PrototypeServiceClass.instance = new PrototypeServiceClass(config);
    }
    return PrototypeServiceClass.instance;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await initDB(this.config);
      this.isInitialized = true;
      // PrototypeService initialized successfully
    } catch (error) {
      console.error('Failed to initialize PrototypeService:', error);
      throw error;
    }
  }

  /**
   * Create a new prototype
   */
  async create(input: CreatePrototypeInput): Promise<Prototype> {
    await this.initialize();

    // Validate input
    this.validateCreateInput(input);

    // Create prototype object
    const prototype: Prototype = {
      id: this.generateId(),
      name: input.name,
      description: input.description,
      schema: input.schema,
      configuration: {
        theme: { mode: 'light' },
        layout: {},
        components: {},
        ...input.configuration
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        status: 'draft',
        isPublic: false,
        viewCount: 0,
        ...input.metadata
      }
    };

    try {
      const created = await dbCreatePrototype(prototype);
      
      // Update cache
      this.updateCache(created);
      
      // Emit event
      this.emit('prototype:created', { prototype: created });
      
      return created;
    } catch (error) {
      console.error('Failed to create prototype:', error);
      throw new Error(`Failed to create prototype: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a prototype by ID
   */
  async get(id: string): Promise<Prototype | null> {
    await this.initialize();

    // Check cache first
    if (this.config.cache?.enabled) {
      const cached = this.getFromCache(id);
      if (cached) {
        return cached;
      }
    }

    try {
      const prototype = await dbGetPrototype(id);
      
      if (prototype) {
        // Update cache
        this.updateCache(prototype);
        
        // Emit view event
        this.emit('prototype:viewed', { 
          id: prototype.id, 
          viewCount: prototype.metadata.viewCount ?? 1 
        });
      }
      
      return prototype;
    } catch (error) {
      console.error('Failed to get prototype:', error);
      throw new Error(`Failed to get prototype: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a prototype
   */
  async update(id: string, updates: UpdatePrototypeInput): Promise<Prototype> {
    await this.initialize();

    try {
      const updated = await dbUpdatePrototype(id, updates as Partial<Prototype>);
      
      // Update cache
      this.updateCache(updated);
      
      // Emit event
      this.emit('prototype:updated', { prototype: updated, changes: updates as Partial<Prototype> });
      
      return updated;
    } catch (error) {
      console.error('Failed to update prototype:', error);
      throw new Error(`Failed to update prototype: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a prototype
   */
  async delete(id: string): Promise<void> {
    await this.initialize();

    try {
      await dbDeletePrototype(id);
      
      // Remove from cache
      this.cache.delete(id);
      
      // Emit event
      this.emit('prototype:deleted', { id });
    } catch (error) {
      console.error('Failed to delete prototype:', error);
      throw new Error(`Failed to delete prototype: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query prototypes with filters and sorting
   */
  async query(
    filters?: PrototypeQueryFilters,
    sort?: PrototypeSortOptions,
    limit?: number,
    offset?: number
  ): Promise<PrototypeQueryResult> {
    await this.initialize();

    try {
      const result = await dbQueryPrototypes(filters, sort, limit, offset);
      
      // Update cache for retrieved prototypes
      if (this.config.cache?.enabled) {
        result.prototypes.forEach(prototype => {
          this.updateCache(prototype);
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to query prototypes:', error);
      throw new Error(`Failed to query prototypes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search prototypes by name and description
   */
  async search(searchTerm: string, filters?: Omit<PrototypeQueryFilters, 'search'>): Promise<PrototypeQueryResult> {
    return this.query({ ...filters, search: searchTerm });
  }

  /**
   * Fork (duplicate) a prototype
   */
  async fork(originalId: string, newName: string, options?: { description?: string; author?: string }): Promise<Prototype> {
    await this.initialize();

    const original = await this.get(originalId);
    if (!original) {
      throw new Error(`Prototype with id ${originalId} not found`);
    }

    const forkedInput: CreatePrototypeInput = {
      name: newName,
      description: options?.description ?? `Fork of ${original.name}`,
      schema: { ...original.schema },
      configuration: { ...original.configuration },
      metadata: {
        author: options?.author,
        tags: [...(original.metadata.tags ?? []), 'fork'],
        status: 'draft'
      }
    };

    const fork = await this.create(forkedInput);
    
    // Update fork metadata to reference original
    await this.update(fork.id, {
      metadata: {
        ...fork.metadata,
        forkOf: originalId
      }
    });

    const updatedFork = await this.get(fork.id);
    
    // Emit event
    this.emit('prototype:forked', { original, fork: updatedFork! });
    
    return updatedFork!;
  }

  /**
   * Export prototypes to JSON
   */
  async export(prototypeIds?: string[]): Promise<PrototypeExport> {
    await this.initialize();

    try {
      let prototypes: Prototype[];
      
      if (prototypeIds && prototypeIds.length > 0) {
        // Export specific prototypes
        prototypes = [];
        for (const id of prototypeIds) {
          const prototype = await this.get(id);
          if (prototype) {
            prototypes.push(prototype);
          }
        }
      } else {
        // Export all prototypes
        prototypes = await dbGetAllPrototypes();
      }

      const exportData: PrototypeExport = {
        version: '1.0.0',
        exportedAt: new Date(),
        prototypes,
        metadata: this.config.export?.includeMetadata ? {
          source: 'mui-pattern-gen',
          generator: 'PrototypeService',
          notes: `Exported ${prototypes.length} prototypes`
        } : undefined
      };

      // Emit event
      this.emit('prototypes:exported', { prototypes, format: 'json' });

      return exportData;
    } catch (error) {
      console.error('Failed to export prototypes:', error);
      throw new Error(`Failed to export prototypes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import prototypes from JSON
   */
  async import(exportData: PrototypeExport, options?: { 
    overwrite?: boolean; 
    prefix?: string;
    updateExisting?: boolean;
  }): Promise<PrototypeImportResult> {
    await this.initialize();

    const result: PrototypeImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
      prototypes: []
    };

    for (const prototypeData of exportData.prototypes) {
      try {
        // Check if prototype already exists
        const existing = await this.get(prototypeData.id);
        
        if (existing && !options?.overwrite && !options?.updateExisting) {
          result.skipped++;
          continue;
        }

        let importedPrototype: Prototype;

        if (existing && options?.updateExisting) {
          // Update existing prototype
          importedPrototype = await this.update(prototypeData.id, {
            name: options.prefix ? `${options.prefix}${prototypeData.name}` : prototypeData.name,
            description: prototypeData.description,
            schema: prototypeData.schema,
            configuration: prototypeData.configuration,
            metadata: {
              ...prototypeData.metadata,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new prototype
          const createInput: CreatePrototypeInput = {
            name: options?.prefix ? `${options.prefix}${prototypeData.name}` : prototypeData.name,
            description: prototypeData.description,
            schema: prototypeData.schema,
            configuration: prototypeData.configuration,
            metadata: prototypeData.metadata
          };

          if (existing && options?.overwrite) {
            // Delete existing first
            await this.delete(prototypeData.id);
          } else if (existing) {
            // Generate new ID to avoid conflicts
            createInput.name = `${createInput.name} (imported)`;
          }

          importedPrototype = await this.create(createInput);
        }

        result.imported++;
        result.prototypes.push(importedPrototype);

      } catch (error) {
        result.errors.push({
          prototype: prototypeData.name || prototypeData.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Emit event
    this.emit('prototypes:imported', { result });

    return result;
  }

  /**
   * Validate prototype data
   */
  validate(prototype: Partial<Prototype>): PrototypeValidationResult {
    const errors: PrototypeValidationResult['errors'] = [];
    const warnings: PrototypeValidationResult['warnings'] = [];

    // Validate required fields
    if (!prototype.name || prototype.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!prototype.schema) {
      errors.push({ field: 'schema', message: 'Schema is required' });
    } else {
      // Validate schema structure
      if (!prototype.schema.type) {
        errors.push({ field: 'schema.type', message: 'Schema type is required' });
      }
      
      if (!prototype.schema.data) {
        errors.push({ field: 'schema.data', message: 'Schema data is required' });
      }
    }

    // Validate name length
    if (prototype.name && prototype.name.length > 100) {
      warnings.push({ field: 'name', message: 'Name is very long (>100 characters)' });
    }

    // Validate description length
    if (prototype.description && prototype.description.length > 500) {
      warnings.push({ field: 'description', message: 'Description is very long (>500 characters)' });
    }

    // Validate metadata
    if (prototype.metadata) {
      if (prototype.metadata.tags && prototype.metadata.tags.length > 10) {
        warnings.push({ field: 'metadata.tags', message: 'Too many tags (>10)' });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    totalPrototypes: number;
    prototypesBy: {
      status: Record<string, number>;
      schemaType: Record<string, number>;
      author: Record<string, number>;
    };
    database: {
      sizeEstimate: number;
      lastCleanup: Date;
    };
    cache: {
      size: number;
      hitRate?: number;
    };
  }> {
    await this.initialize();

    try {
      const dbStats = await getDBStats();
      const allPrototypes = await dbGetAllPrototypes();

      // Calculate statistics
      const prototypesBy = {
        status: {} as Record<string, number>,
        schemaType: {} as Record<string, number>,
        author: {} as Record<string, number>
      };

      allPrototypes.forEach(prototype => {
        // Status stats
        prototypesBy.status[prototype.metadata.status] = 
          (prototypesBy.status[prototype.metadata.status] ?? 0) + 1;
        
        // Schema type stats
        prototypesBy.schemaType[prototype.schema.type] = 
          (prototypesBy.schemaType[prototype.schema.type] ?? 0) + 1;
        
        // Author stats
        const author = prototype.metadata.author ?? 'Unknown';
        prototypesBy.author[author] = (prototypesBy.author[author] ?? 0) + 1;
      });

      return {
        totalPrototypes: dbStats.totalPrototypes,
        prototypesBy,
        database: {
          sizeEstimate: dbStats.sizeEstimate,
          lastCleanup: dbStats.lastCleanup
        },
        cache: {
          size: this.cache.size
        }
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up service resources
   */
  async cleanup(): Promise<void> {
    try {
      await cleanupDB();
      this.cache.clear();
      this.removeAllListeners();
    } catch (error) {
      console.error('Failed to cleanup service:', error);
    }
  }

  /**
   * Close service and database connections
   */
  async close(): Promise<void> {
    await this.cleanup();
    closeDB();
    this.isInitialized = false;
  }

  // Private helper methods

  private validateCreateInput(input: CreatePrototypeInput): void {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Prototype name is required');
    }

    if (!input.schema) {
      throw new Error('Prototype schema is required');
    }

    if (!input.schema.type || !input.schema.data) {
      throw new Error('Invalid schema: type and data are required');
    }
  }

  private generateId(): string {
    return `prototype-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateCache(prototype: Prototype): void {
    if (!this.config.cache?.enabled) {
      return;
    }

    // Check cache size limit
    if (this.cache.size >= (this.config.cache.maxSize ?? 100)) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = Math.max(1, Math.floor(this.cache.size * 0.2)); // Remove 20%
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(prototype.id, {
      prototype,
      timestamp: Date.now()
    });
  }

  private getFromCache(id: string): Prototype | null {
    if (!this.config.cache?.enabled) {
      return null;
    }

    const cached = this.cache.get(id);
    if (!cached) {
      return null;
    }

    // Check if expired
    const maxAge = this.config.cache.maxAge ?? 5 * 60 * 1000;
    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(id);
      return null;
    }

    return cached.prototype;
  }
}

// Export singleton instance
export const PrototypeService = PrototypeServiceClass.getInstance();

// Export class for testing
export { PrototypeServiceClass };