/**
 * IndexedDB implementation for prototype persistence
 * Provides offline-first storage with robust error handling and migrations
 */

import { 
  Prototype, 
  PrototypeQueryFilters, 
  PrototypeSortOptions, 
  PrototypeQueryResult,
  PrototypeServiceConfig 
} from '../../types/prototype';

/**
 * IndexedDB database schema version
 */
const DB_VERSION = 1;
const DB_NAME = 'PrototypeDB';

/**
 * Store names in the database
 */
const STORES = {
  PROTOTYPES: 'prototypes',
  METADATA: 'metadata'
} as const;

/**
 * Database connection instance
 */
let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection with proper error handling and migrations
 */
export async function initDB(config?: PrototypeServiceConfig): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config?.database?.name || DB_NAME, config?.database?.version || DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      
      // Handle unexpected closure
      dbInstance.onclose = () => {
        console.warn('IndexedDB connection closed unexpectedly');
        dbInstance = null;
      };
      
      // Handle version changes from other tabs
      dbInstance.onversionchange = () => {
        console.warn('Database version changed in another tab');
        dbInstance?.close();
        dbInstance = null;
      };
      
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;
      
      try {
        // Create prototypes store
        if (!db.objectStoreNames.contains(STORES.PROTOTYPES)) {
          const prototypeStore = db.createObjectStore(STORES.PROTOTYPES, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          prototypeStore.createIndex('name', 'name', { unique: false });
          prototypeStore.createIndex('status', 'metadata.status', { unique: false });
          prototypeStore.createIndex('schemaType', 'schema.type', { unique: false });
          prototypeStore.createIndex('author', 'metadata.author', { unique: false });
          prototypeStore.createIndex('category', 'metadata.category', { unique: false });
          prototypeStore.createIndex('tags', 'metadata.tags', { unique: false, multiEntry: true });
          prototypeStore.createIndex('createdAt', 'metadata.createdAt', { unique: false });
          prototypeStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
          prototypeStore.createIndex('viewCount', 'metadata.viewCount', { unique: false });
          prototypeStore.createIndex('isPublic', 'metadata.isPublic', { unique: false });
          
          // Compound indexes for common query patterns
          prototypeStore.createIndex('status_updatedAt', ['metadata.status', 'metadata.updatedAt'], { unique: false });
          prototypeStore.createIndex('schemaType_createdAt', ['schema.type', 'metadata.createdAt'], { unique: false });
        }
        
        // Create metadata store for app-level data
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          const metadataStore = db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
          
          // Initialize with default metadata
          transaction.oncomplete = () => {
            const metaTransaction = db.transaction([STORES.METADATA], 'readwrite');
            const metaStore = metaTransaction.objectStore(STORES.METADATA);
            
            metaStore.put({
              key: 'version',
              value: DB_VERSION,
              updatedAt: new Date()
            });
            
            metaStore.put({
              key: 'stats',
              value: {
                totalPrototypes: 0,
                lastCleanup: new Date(),
                dbSize: 0
              },
              updatedAt: new Date()
            });
          };
        }
        
        console.log('Database schema created successfully');
      } catch (error) {
        console.error('Failed to create database schema:', error);
        transaction.abort();
        reject(error);
      }
    };
  });
}

/**
 * Get database instance, initializing if necessary
 */
async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance!;
}

/**
 * Execute a transaction with proper error handling
 */
function executeTransaction<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  operation: (stores: IDBObjectStore | IDBObjectStore[]) => Promise<T> | T
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDB();
      const transaction = db.transaction(storeNames, mode);
      
      const stores = Array.isArray(storeNames)
        ? storeNames.map(name => transaction.objectStore(name))
        : transaction.objectStore(storeNames);
      
      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
      
      transaction.onabort = () => {
        reject(new Error('Transaction was aborted'));
      };
      
      try {
        const result = await operation(stores);
        
        transaction.oncomplete = () => resolve(result);
        
        // If operation doesn't trigger completion, resolve immediately
        if (transaction.readyState === 'finished') {
          resolve(result);
        }
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create a new prototype
 */
export async function createPrototype(prototype: Prototype): Promise<Prototype> {
  return executeTransaction(STORES.PROTOTYPES, 'readwrite', (store) => {
    return new Promise<Prototype>((resolve, reject) => {
      const request = (store as IDBObjectStore).add(prototype);
      
      request.onsuccess = () => resolve(prototype);
      request.onerror = () => reject(new Error(`Failed to create prototype: ${request.error?.message}`));
    });
  });
}

/**
 * Get a prototype by ID
 */
export async function getPrototype(id: string): Promise<Prototype | null> {
  return executeTransaction(STORES.PROTOTYPES, 'readonly', (store) => {
    return new Promise<Prototype | null>((resolve, reject) => {
      const request = (store as IDBObjectStore).get(id);
      
      request.onsuccess = () => {
        const result = request.result as Prototype | undefined;
        
        if (result) {
          // Update view count and last viewed
          updatePrototypeMetadata(id, {
            viewCount: (result.metadata.viewCount || 0) + 1,
            lastViewedAt: new Date()
          }).catch(console.warn); // Don't fail the read operation
        }
        
        resolve(result || null);
      };
      request.onerror = () => reject(new Error(`Failed to get prototype: ${request.error?.message}`));
    });
  });
}

/**
 * Update a prototype
 */
export async function updatePrototype(id: string, updates: Partial<Prototype>): Promise<Prototype> {
  return executeTransaction(STORES.PROTOTYPES, 'readwrite', (store) => {
    return new Promise<Prototype>((resolve, reject) => {
      const getRequest = (store as IDBObjectStore).get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result as Prototype;
        if (!existing) {
          reject(new Error(`Prototype with id ${id} not found`));
          return;
        }
        
        // Merge updates with existing data
        const updated: Prototype = {
          ...existing,
          ...updates,
          metadata: {
            ...existing.metadata,
            ...updates.metadata,
            updatedAt: new Date(),
            version: existing.metadata.version + 1
          }
        };
        
        const putRequest = (store as IDBObjectStore).put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(new Error(`Failed to update prototype: ${putRequest.error?.message}`));
      };
      
      getRequest.onerror = () => reject(new Error(`Failed to find prototype: ${getRequest.error?.message}`));
    });
  });
}

/**
 * Delete a prototype
 */
export async function deletePrototype(id: string): Promise<void> {
  return executeTransaction(STORES.PROTOTYPES, 'readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = (store as IDBObjectStore).delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete prototype: ${request.error?.message}`));
    });
  });
}

/**
 * Query prototypes with filters and sorting
 */
export async function queryPrototypes(
  filters: PrototypeQueryFilters = {}, 
  sort?: PrototypeSortOptions,
  limit?: number,
  offset?: number
): Promise<PrototypeQueryResult> {
  return executeTransaction(STORES.PROTOTYPES, 'readonly', (store) => {
    return new Promise<PrototypeQueryResult>((resolve, reject) => {
      let request: IDBRequest;
      const results: Prototype[] = [];
      let total = 0;
      let skipped = 0;
      
      // Determine the best index to use based on filters
      const objectStore = store as IDBObjectStore;
      
      if (filters.status && filters.status.length === 1) {
        // Use status index
        const index = objectStore.index('status');
        request = index.openCursor(IDBKeyRange.only(filters.status[0]));
      } else if (filters.schemaType && filters.schemaType.length === 1) {
        // Use schemaType index
        const index = objectStore.index('schemaType');
        request = index.openCursor(IDBKeyRange.only(filters.schemaType[0]));
      } else if (filters.author) {
        // Use author index
        const index = objectStore.index('author');
        request = index.openCursor(IDBKeyRange.only(filters.author));
      } else if (filters.category) {
        // Use category index
        const index = objectStore.index('category');
        request = index.openCursor(IDBKeyRange.only(filters.category));
      } else if (filters.tags && filters.tags.length > 0) {
        // Use tags index for first tag
        const index = objectStore.index('tags');
        request = index.openCursor(IDBKeyRange.only(filters.tags[0]));
      } else {
        // Use primary key or appropriate sort index
        if (sort?.field === 'createdAt') {
          const index = objectStore.index('createdAt');
          request = index.openCursor(null, sort.direction === 'desc' ? 'prev' : 'next');
        } else if (sort?.field === 'updatedAt') {
          const index = objectStore.index('updatedAt');
          request = index.openCursor(null, sort.direction === 'desc' ? 'prev' : 'next');
        } else if (sort?.field === 'viewCount') {
          const index = objectStore.index('viewCount');
          request = index.openCursor(null, sort.direction === 'desc' ? 'prev' : 'next');
        } else {
          // Default to all records
          request = objectStore.openCursor();
        }
      }
      
      request.onsuccess = () => {
        const cursor = request.result;
        
        if (!cursor) {
          // Sort results if not using an index for sorting
          if (sort && !['createdAt', 'updatedAt', 'viewCount'].includes(sort.field)) {
            results.sort((a, b) => {
              let aVal: any, bVal: any;
              
              switch (sort.field) {
                case 'name':
                  aVal = a.name.toLowerCase();
                  bVal = b.name.toLowerCase();
                  break;
                default:
                  aVal = a[sort.field as keyof Prototype];
                  bVal = b[sort.field as keyof Prototype];
              }
              
              if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
              if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
              return 0;
            });
          }
          
          resolve({
            prototypes: results,
            total,
            hasMore: limit ? total > (offset || 0) + limit : false,
            nextOffset: limit && total > (offset || 0) + limit ? (offset || 0) + limit : undefined
          });
          return;
        }
        
        const prototype = cursor.value as Prototype;
        
        // Apply filters
        if (!matchesFilters(prototype, filters)) {
          cursor.continue();
          return;
        }
        
        total++;
        
        // Apply pagination
        if (offset && skipped < offset) {
          skipped++;
          cursor.continue();
          return;
        }
        
        if (limit && results.length >= limit) {
          cursor.continue();
          return;
        }
        
        results.push(prototype);
        cursor.continue();
      };
      
      request.onerror = () => reject(new Error(`Failed to query prototypes: ${request.error?.message}`));
    });
  });
}

/**
 * Get all prototypes (for export/backup)
 */
export async function getAllPrototypes(): Promise<Prototype[]> {
  const result = await queryPrototypes({}, { field: 'updatedAt', direction: 'desc' });
  return result.prototypes;
}

/**
 * Update only metadata fields for performance
 */
async function updatePrototypeMetadata(id: string, metadataUpdates: Partial<Prototype['metadata']>): Promise<void> {
  return executeTransaction(STORES.PROTOTYPES, 'readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const getRequest = (store as IDBObjectStore).get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result as Prototype;
        if (!existing) {
          resolve(); // Silently ignore if not found (for view tracking)
          return;
        }
        
        const updated: Prototype = {
          ...existing,
          metadata: {
            ...existing.metadata,
            ...metadataUpdates
          }
        };
        
        const putRequest = (store as IDBObjectStore).put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error(`Failed to update metadata: ${putRequest.error?.message}`));
      };
      
      getRequest.onerror = () => reject(new Error(`Failed to find prototype: ${getRequest.error?.message}`));
    });
  });
}

/**
 * Check if a prototype matches the given filters
 */
function matchesFilters(prototype: Prototype, filters: PrototypeQueryFilters): boolean {
  // Status filter
  if (filters.status && !filters.status.includes(prototype.metadata.status)) {
    return false;
  }
  
  // Schema type filter
  if (filters.schemaType && !filters.schemaType.includes(prototype.schema.type)) {
    return false;
  }
  
  // Author filter
  if (filters.author && prototype.metadata.author !== filters.author) {
    return false;
  }
  
  // Category filter
  if (filters.category && prototype.metadata.category !== filters.category) {
    return false;
  }
  
  // Public filter
  if (filters.isPublic !== undefined && prototype.metadata.isPublic !== filters.isPublic) {
    return false;
  }
  
  // Tags filter (prototype must have ALL specified tags)
  if (filters.tags && filters.tags.length > 0) {
    const prototypeTags = prototype.metadata.tags || [];
    if (!filters.tags.every(tag => prototypeTags.includes(tag))) {
      return false;
    }
  }
  
  // Date filters
  if (filters.createdAfter && prototype.metadata.createdAt < filters.createdAfter) {
    return false;
  }
  
  if (filters.createdBefore && prototype.metadata.createdAt > filters.createdBefore) {
    return false;
  }
  
  if (filters.updatedAfter && prototype.metadata.updatedAt < filters.updatedAfter) {
    return false;
  }
  
  if (filters.updatedBefore && prototype.metadata.updatedAt > filters.updatedBefore) {
    return false;
  }
  
  // Search filter (name and description)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const nameMatch = prototype.name.toLowerCase().includes(searchTerm);
    const descMatch = prototype.description?.toLowerCase().includes(searchTerm);
    
    if (!nameMatch && !descMatch) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  totalPrototypes: number;
  sizeEstimate: number;
  lastCleanup: Date;
}> {
  return executeTransaction([STORES.PROTOTYPES, STORES.METADATA], 'readonly', (stores) => {
    return new Promise<any>((resolve, reject) => {
      const [prototypeStore, metadataStore] = stores as IDBObjectStore[];
      
      // Count prototypes
      const countRequest = prototypeStore.count();
      
      countRequest.onsuccess = () => {
        const getStatsRequest = metadataStore.get('stats');
        
        getStatsRequest.onsuccess = () => {
          const stats = getStatsRequest.result?.value || {};
          
          resolve({
            totalPrototypes: countRequest.result,
            sizeEstimate: stats.dbSize || 0,
            lastCleanup: stats.lastCleanup ? new Date(stats.lastCleanup) : new Date()
          });
        };
        
        getStatsRequest.onerror = () => resolve({
          totalPrototypes: countRequest.result,
          sizeEstimate: 0,
          lastCleanup: new Date()
        });
      };
      
      countRequest.onerror = () => reject(new Error(`Failed to get stats: ${countRequest.error?.message}`));
    });
  });
}

/**
 * Clean up database (remove orphaned data, etc.)
 */
export async function cleanupDB(): Promise<void> {
  return executeTransaction([STORES.PROTOTYPES, STORES.METADATA], 'readwrite', (stores) => {
    return new Promise<void>((resolve, reject) => {
      const [, metadataStore] = stores as IDBObjectStore[];
      
      // Update cleanup timestamp
      const updateRequest = metadataStore.put({
        key: 'stats',
        value: {
          lastCleanup: new Date()
        },
        updatedAt: new Date()
      });
      
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(new Error(`Failed to update cleanup stats: ${updateRequest.error?.message}`));
    });
  });
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete entire database (for testing/reset)
 */
export async function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    closeDB();
    
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(new Error(`Failed to delete database: ${deleteRequest.error?.message}`));
    deleteRequest.onblocked = () => {
      console.warn('Database deletion blocked - close all tabs using this database');
      reject(new Error('Database deletion blocked by other connections'));
    };
  });
}