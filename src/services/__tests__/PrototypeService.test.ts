/**
 * Unit tests for PrototypeService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrototypeServiceClass } from '../PrototypeService';
import { 
  Prototype, 
  CreatePrototypeInput, 
  PrototypeStatus,
  SchemaType
} from '../../types/prototype';

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  objectStore: vi.fn(),
  createObjectStore: vi.fn(),
  close: vi.fn()
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockObjectStore = {
  add: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  openCursor: vi.fn(),
  count: vi.fn(),
  createIndex: vi.fn()
};

const mockRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
  error: null
};

// Mock the IndexedDB API
global.indexedDB = {
  open: vi.fn(() => {
    const request = { ...mockRequest };
    setTimeout(() => {
      request.result = mockDB;
      request.onsuccess?.();
    }, 0);
    return request;
  }),
  deleteDatabase: vi.fn(() => mockRequest)
} as any;

mockDB.transaction.mockReturnValue(mockTransaction);

describe('PrototypeService', () => {
  let service: PrototypeServiceClass;
  let mockPrototype: Prototype;
  let mockCreateInput: CreatePrototypeInput;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a fresh service instance for each test
    service = new PrototypeServiceClass({
      cache: { enabled: false } // Disable cache for testing
    });

    mockPrototype = {
      id: 'test-prototype-1',
      name: 'Test Prototype',
      description: 'A test prototype',
      schema: {
        type: 'component' as SchemaType,
        data: {
          id: 'test-component',
          name: 'TestComponent',
          type: 'display',
          props: []
        }
      },
      configuration: {
        theme: { mode: 'light' }
      },
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: 1,
        status: 'draft' as PrototypeStatus,
        isPublic: false,
        viewCount: 0
      }
    };

    mockCreateInput = {
      name: 'Test Prototype',
      description: 'A test prototype',
      schema: {
        type: 'component' as SchemaType,
        data: {
          id: 'test-component',
          name: 'TestComponent',
          type: 'display',
          props: []
        }
      }
    };

    // Setup default mock responses
    mockObjectStore.add.mockImplementation((data) => {
      const request = { ...mockRequest };
      setTimeout(() => {
        request.result = data;
        request.onsuccess?.();
      }, 0);
      return request;
    });

    mockObjectStore.get.mockImplementation((id) => {
      const request = { ...mockRequest };
      setTimeout(() => {
        request.result = id === mockPrototype.id ? mockPrototype : undefined;
        request.onsuccess?.();
      }, 0);
      return request;
    });

    mockObjectStore.put.mockImplementation((data) => {
      const request = { ...mockRequest };
      setTimeout(() => {
        request.result = data;
        request.onsuccess?.();
      }, 0);
      return request;
    });

    mockObjectStore.delete.mockImplementation(() => {
      const request = { ...mockRequest };
      setTimeout(() => {
        request.onsuccess?.();
      }, 0);
      return request;
    });
  });

  afterEach(async () => {
    await service.close();
  });

  describe('create', () => {
    it('should create a new prototype with valid input', async () => {
      const result = await service.create(mockCreateInput);

      expect(result).toBeDefined();
      expect(result.name).toBe(mockCreateInput.name);
      expect(result.description).toBe(mockCreateInput.description);
      expect(result.schema).toEqual(mockCreateInput.schema);
      expect(result.id).toBeDefined();
      expect(result.metadata.version).toBe(1);
      expect(result.metadata.status).toBe('draft');
    });

    it('should throw error with empty name', async () => {
      const invalidInput = { ...mockCreateInput, name: '' };
      
      await expect(service.create(invalidInput)).rejects.toThrow('Prototype name is required');
    });

    it('should throw error with missing schema', async () => {
      const invalidInput = { ...mockCreateInput };
      delete (invalidInput as any).schema;
      
      await expect(service.create(invalidInput)).rejects.toThrow('Prototype schema is required');
    });

    it('should emit created event', async () => {
      const eventSpy = vi.fn();
      service.on('prototype:created', eventSpy);

      const result = await service.create(mockCreateInput);

      expect(eventSpy).toHaveBeenCalledWith({ prototype: result });
    });
  });

  describe('get', () => {
    it('should retrieve existing prototype', async () => {
      const result = await service.get(mockPrototype.id);

      expect(result).toEqual(mockPrototype);
    });

    it('should return null for non-existent prototype', async () => {
      const result = await service.get('non-existent-id');

      expect(result).toBeNull();
    });

    it('should emit viewed event when prototype is found', async () => {
      const eventSpy = vi.fn();
      service.on('prototype:viewed', eventSpy);

      await service.get(mockPrototype.id);

      expect(eventSpy).toHaveBeenCalledWith({
        id: mockPrototype.id,
        viewCount: expect.any(Number)
      });
    });
  });

  describe('update', () => {
    it('should update existing prototype', async () => {
      const updates = {
        name: 'Updated Prototype',
        description: 'Updated description'
      };

      // Mock the get operation to return existing prototype
      mockObjectStore.get.mockImplementationOnce((id) => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockPrototype;
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const result = await service.update(mockPrototype.id, updates);

      expect(result.name).toBe(updates.name);
      expect(result.description).toBe(updates.description);
      expect(result.metadata.version).toBe(mockPrototype.metadata.version + 1);
    });

    it('should emit updated event', async () => {
      const eventSpy = vi.fn();
      service.on('prototype:updated', eventSpy);

      const updates = { name: 'Updated Name' };

      // Mock the get operation
      mockObjectStore.get.mockImplementationOnce((id) => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockPrototype;
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const result = await service.update(mockPrototype.id, updates);

      expect(eventSpy).toHaveBeenCalledWith({
        prototype: result,
        changes: updates
      });
    });
  });

  describe('delete', () => {
    it('should delete existing prototype', async () => {
      await service.delete(mockPrototype.id);

      expect(mockObjectStore.delete).toHaveBeenCalledWith(mockPrototype.id);
    });

    it('should emit deleted event', async () => {
      const eventSpy = vi.fn();
      service.on('prototype:deleted', eventSpy);

      await service.delete(mockPrototype.id);

      expect(eventSpy).toHaveBeenCalledWith({ id: mockPrototype.id });
    });
  });

  describe('fork', () => {
    it('should create a fork of existing prototype', async () => {
      const newName = 'Forked Prototype';
      const options = { description: 'Fork description', author: 'Test Author' };

      // Mock get to return original prototype
      mockObjectStore.get.mockImplementation((id) => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (id === mockPrototype.id) {
            request.result = mockPrototype;
          } else {
            // Return the forked prototype with updated metadata
            request.result = {
              ...mockPrototype,
              id,
              name: newName,
              metadata: {
                ...mockPrototype.metadata,
                forkOf: mockPrototype.id
              }
            };
          }
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const result = await service.fork(mockPrototype.id, newName, options);

      expect(result).toBeDefined();
      expect(result!.name).toBe(newName);
      expect(result!.metadata.forkOf).toBe(mockPrototype.id);
    });

    it('should emit forked event', async () => {
      const eventSpy = vi.fn();
      service.on('prototype:forked', eventSpy);

      const newName = 'Forked Prototype';

      // Mock get operations
      mockObjectStore.get.mockImplementation((id) => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (id === mockPrototype.id) {
            request.result = mockPrototype;
          } else {
            request.result = {
              ...mockPrototype,
              id,
              name: newName,
              metadata: {
                ...mockPrototype.metadata,
                forkOf: mockPrototype.id
              }
            };
          }
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const result = await service.fork(mockPrototype.id, newName);

      expect(eventSpy).toHaveBeenCalledWith({
        original: mockPrototype,
        fork: result
      });
    });
  });

  describe('validate', () => {
    it('should validate valid prototype', () => {
      const result = service.validate(mockPrototype);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing name', () => {
      const invalid = { ...mockPrototype, name: '' };
      const result = service.validate(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Name is required'
      });
    });

    it('should detect missing schema', () => {
      const invalid = { ...mockPrototype };
      delete (invalid as any).schema;
      const result = service.validate(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schema',
        message: 'Schema is required'
      });
    });

    it('should warn about long name', () => {
      const invalid = { ...mockPrototype, name: 'a'.repeat(101) };
      const result = service.validate(invalid);

      expect(result.warnings).toContainEqual({
        field: 'name',
        message: 'Name is very long (>100 characters)'
      });
    });
  });

  describe('export/import', () => {
    it('should export prototypes', async () => {
      // Mock getAllPrototypes to return array of prototypes
      mockObjectStore.openCursor.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          let callCount = 0;
          request.onsuccess = () => {
            if (callCount === 0) {
              request.result = {
                value: mockPrototype,
                continue: () => {
                  callCount++;
                  setTimeout(() => {
                    request.result = null; // End cursor
                    request.onsuccess?.();
                  }, 0);
                }
              };
              request.onsuccess?.();
            }
          };
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const exportData = await service.export([mockPrototype.id]);

      expect(exportData.version).toBeDefined();
      expect(exportData.exportedAt).toBeInstanceOf(Date);
      expect(exportData.prototypes).toContain(mockPrototype);
    });

    it('should import prototypes', async () => {
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date(),
        prototypes: [mockPrototype]
      };

      // Mock get to return null (prototype doesn't exist)
      mockObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = undefined;
          request.onsuccess?.();
        }, 0);
        return request;
      });

      const result = await service.import(exportData);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('singleton behavior', () => {
    it('should return same instance', () => {
      const instance1 = PrototypeServiceClass.getInstance();
      const instance2 = PrototypeServiceClass.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('event system', () => {
    it('should handle event subscription and emission', () => {
      const handler = vi.fn();
      
      service.on('prototype:created', handler);
      service.emit('prototype:created', { prototype: mockPrototype });

      expect(handler).toHaveBeenCalledWith({ prototype: mockPrototype });
    });

    it('should handle event unsubscription', () => {
      const handler = vi.fn();
      
      service.on('prototype:created', handler);
      service.off('prototype:created', handler);
      service.emit('prototype:created', { prototype: mockPrototype });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in event handlers gracefully', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      service.on('prototype:created', errorHandler);
      service.emit('prototype:created', { prototype: mockPrototype });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});