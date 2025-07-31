/**
 * Unit tests for usePrototype hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePrototype, usePrototypeQuery, usePrototypeCreate } from '../usePrototype';
import { PrototypeService } from '../../services/PrototypeService';
import { Prototype, CreatePrototypeInput } from '../../types/prototype';

// Mock the PrototypeService
vi.mock('../../services/PrototypeService', () => ({
  PrototypeService: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: vi.fn(),
    fork: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}));

const mockPrototypeService = PrototypeService as any;

describe('usePrototype', () => {
  const mockPrototype: Prototype = {
    id: 'test-1',
    name: 'Test Prototype',
    description: 'Test description',
    schema: {
      type: 'component',
      data: { id: 'test', name: 'Test', type: 'display', props: [] }
    },
    configuration: { theme: { mode: 'light' } },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      status: 'draft',
      isPublic: false,
      viewCount: 5
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrototypeService.get.mockResolvedValue(mockPrototype);
    mockPrototypeService.update.mockResolvedValue(mockPrototype);
    mockPrototypeService.delete.mockResolvedValue(undefined);
    mockPrototypeService.fork.mockResolvedValue(mockPrototype);
    mockPrototypeService.on.mockImplementation(() => {});
    mockPrototypeService.off.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePrototype hook', () => {
    it('should fetch prototype on mount', async () => {
      const { result } = renderHook(() => usePrototype('test-1'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPrototype);
      expect(result.current.error).toBeNull();
      expect(mockPrototypeService.get).toHaveBeenCalledWith('test-1');
    });

    it('should not fetch when id is null', () => {
      const { result } = renderHook(() => usePrototype(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(mockPrototypeService.get).not.toHaveBeenCalled();
    });

    it('should not fetch when enabled is false', () => {
      const { result } = renderHook(() => 
        usePrototype('test-1', { enabled: false })
      );

      expect(result.current.loading).toBe(false);
      expect(mockPrototypeService.get).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed');
      mockPrototypeService.get.mockRejectedValue(error);

      const { result } = renderHook(() => usePrototype('test-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });

    it('should call onSuccess when fetch succeeds', async () => {
      const onSuccess = vi.fn();
      
      renderHook(() => usePrototype('test-1', { onSuccess }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockPrototype);
      });
    });

    it('should call onError when fetch fails', async () => {
      const error = new Error('Fetch failed');
      const onError = vi.fn();
      mockPrototypeService.get.mockRejectedValue(error);

      renderHook(() => usePrototype('test-1', { onError }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });

    it('should refetch when refetch is called', async () => {
      const { result } = renderHook(() => usePrototype('test-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockPrototypeService.get).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockPrototypeService.get).toHaveBeenCalledTimes(2);
    });

    it('should update prototype', async () => {
      const updates = { name: 'Updated Name' };
      const { result } = renderHook(() => usePrototype('test-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.update(updates);
      });

      expect(mockPrototypeService.update).toHaveBeenCalledWith('test-1', updates);
    });

    it('should delete prototype', async () => {
      const { result } = renderHook(() => usePrototype('test-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.delete();
      });

      expect(mockPrototypeService.delete).toHaveBeenCalledWith('test-1');
    });

    it('should fork prototype', async () => {
      const { result } = renderHook(() => usePrototype('test-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const forkOptions = { description: 'Forked version' };
      await act(async () => {
        await result.current.fork('Forked Prototype', forkOptions);
      });

      expect(mockPrototypeService.fork).toHaveBeenCalledWith('test-1', 'Forked Prototype', forkOptions);
    });

    it('should subscribe to prototype events', () => {
      renderHook(() => usePrototype('test-1'));

      expect(mockPrototypeService.on).toHaveBeenCalledWith('prototype:updated', expect.any(Function));
      expect(mockPrototypeService.on).toHaveBeenCalledWith('prototype:deleted', expect.any(Function));
    });

    it('should unsubscribe from events on unmount', () => {
      const { unmount } = renderHook(() => usePrototype('test-1'));

      unmount();

      expect(mockPrototypeService.off).toHaveBeenCalledWith('prototype:updated', expect.any(Function));
      expect(mockPrototypeService.off).toHaveBeenCalledWith('prototype:deleted', expect.any(Function));
    });
  });

  describe('usePrototypeQuery hook', () => {
    const mockQueryResult = {
      prototypes: [mockPrototype],
      total: 1,
      hasMore: false,
      nextOffset: undefined
    };

    beforeEach(() => {
      mockPrototypeService.query.mockResolvedValue(mockQueryResult);
    });

    it('should query prototypes on mount', async () => {
      const filters = { status: ['draft'] as any };
      const sort = { field: 'name', direction: 'asc' } as any;
      
      const { result } = renderHook(() => usePrototypeQuery(filters, sort));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.data).toEqual(mockQueryResult);
      expect(mockPrototypeService.query).toHaveBeenCalledWith(filters, sort, 20, 0);
    });

    it('should load more prototypes', async () => {
      const mockQueryResultWithMore = {
        ...mockQueryResult,
        hasMore: true,
        nextOffset: 20
      };

      mockPrototypeService.query.mockResolvedValue(mockQueryResultWithMore);

      const { result } = renderHook(() => usePrototypeQuery());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.hasMore).toBe(true);

      // Mock load more response
      const moreResults = {
        prototypes: [{ ...mockPrototype, id: 'test-2' }],
        total: 2,
        hasMore: false
      };
      mockPrototypeService.query.mockResolvedValue(moreResults);

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockPrototypeService.query).toHaveBeenCalledWith(undefined, undefined, 20, 20);
    });

    it('should refetch query', async () => {
      const { result } = renderHook(() => usePrototypeQuery());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(mockPrototypeService.query).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockPrototypeService.query).toHaveBeenCalledTimes(2);
    });

    it('should handle query error', async () => {
      const error = new Error('Query failed');
      mockPrototypeService.query.mockRejectedValue(error);

      const { result } = renderHook(() => usePrototypeQuery());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeNull();
    });
  });

  describe('usePrototypeCreate hook', () => {
    const mockCreateInput: CreatePrototypeInput = {
      name: 'New Prototype',
      schema: {
        type: 'component',
        data: { id: 'new', name: 'New', type: 'display', props: [] }
      }
    };

    beforeEach(() => {
      mockPrototypeService.create.mockResolvedValue(mockPrototype);
    });

    it('should create prototype', async () => {
      const { result } = renderHook(() => usePrototypeCreate());

      expect(result.current.loading).toBe(false);

      let createdPrototype;
      await act(async () => {
        createdPrototype = await result.current.create(mockCreateInput);
      });

      expect(mockPrototypeService.create).toHaveBeenCalledWith(mockCreateInput);
      expect(createdPrototype).toEqual(mockPrototype);
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      mockPrototypeService.create.mockRejectedValue(error);
      
      const { result } = renderHook(() => usePrototypeCreate());

      let createdPrototype;
      await act(async () => {
        createdPrototype = await result.current.create(mockCreateInput);
      });

      expect(result.current.error).toEqual(error);
      expect(createdPrototype).toBeNull();
    });

    it('should call onSuccess when create succeeds', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => usePrototypeCreate({ onSuccess }));

      await act(async () => {
        await result.current.create(mockCreateInput);
      });

      expect(onSuccess).toHaveBeenCalledWith(mockPrototype);
    });

    it('should call onError when create fails', async () => {
      const error = new Error('Create failed');
      const onError = vi.fn();
      mockPrototypeService.create.mockRejectedValue(error);
      
      const { result } = renderHook(() => usePrototypeCreate({ onError }));

      await act(async () => {
        await result.current.create(mockCreateInput);
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should update loading state during create', async () => {
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise(resolve => {
        resolveCreate = resolve;
      });
      mockPrototypeService.create.mockReturnValue(createPromise);

      const { result } = renderHook(() => usePrototypeCreate());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.create(mockCreateInput);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveCreate!(mockPrototype);
        await createPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });
});