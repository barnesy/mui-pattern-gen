/**
 * React hook for prototype management
 * Provides easy integration with React components with automatic updates and error handling
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Prototype, 
  CreatePrototypeInput, 
  UpdatePrototypeInput,
  PrototypeQueryFilters, 
  PrototypeSortOptions,
  PrototypeQueryResult,
  PrototypeEvents
} from '../types/prototype';
import { PrototypeService } from '../services/PrototypeService';

/**
 * Hook options for prototype operations
 */
export interface UsePrototypeOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
}

/**
 * State for individual prototype operations
 */
export interface UsePrototypeState {
  data: Prototype | null;
  loading: boolean;
  error: Error | null;
}

/**
 * State for prototype query operations
 */
export interface UsePrototypeQueryState {
  data: PrototypeQueryResult | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Result for prototype CRUD operations
 */
export interface UsePrototypeResult extends UsePrototypeState {
  refetch: () => Promise<void>;
  update: (updates: UpdatePrototypeInput) => Promise<Prototype | null>;
  delete: () => Promise<void>;
  fork: (newName: string, options?: { description?: string; author?: string }) => Promise<Prototype | null>;
}

/**
 * Result for prototype query operations
 */
export interface UsePrototypeQueryResult extends UsePrototypeQueryState {
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  total: number;
}

/**
 * Result for prototype creation operations
 */
export interface UsePrototypeCreateResult {
  create: (input: CreatePrototypeInput) => Promise<Prototype | null>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for managing a single prototype by ID
 */
export function usePrototype(id: string | null, options: UsePrototypeOptions = {}): UsePrototypeResult {
  const { onSuccess, onError, enabled = true, refetchOnMount = true, refetchInterval } = options;

  const [state, setState] = useState<UsePrototypeState>({
    data: null,
    loading: enabled && !!id,
    error: null
  });

  // Fetch function
  const fetchPrototype = useCallback(async () => {
    if (!id || !enabled) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const prototype = await PrototypeService.get(id);
      setState({ data: prototype, loading: false, error: null });
      
      if (prototype) {
        onSuccess?.(prototype);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: errorObj });
      onError?.(errorObj);
    }
  }, [id, enabled, onSuccess, onError]);

  // Update function
  const update = useCallback(async (updates: UpdatePrototypeInput): Promise<Prototype | null> => {
    if (!id) {
      throw new Error('Cannot update prototype without ID');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updated = await PrototypeService.update(id, updates);
      setState({ data: updated, loading: false, error: null });
      onSuccess?.(updated);
      return updated;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: errorObj }));
      onError?.(errorObj);
      return null;
    }
  }, [id, onSuccess, onError]);

  // Delete function
  const deletePrototype = useCallback(async (): Promise<void> => {
    if (!id) {
      throw new Error('Cannot delete prototype without ID');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await PrototypeService.delete(id);
      setState({ data: null, loading: false, error: null });
      onSuccess?.(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: errorObj }));
      onError?.(errorObj);
    }
  }, [id, onSuccess, onError]);

  // Fork function
  const fork = useCallback(async (newName: string, forkOptions?: { description?: string; author?: string }): Promise<Prototype | null> => {
    if (!id) {
      throw new Error('Cannot fork prototype without ID');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const forked = await PrototypeService.fork(id, newName, forkOptions);
      setState(prev => ({ ...prev, loading: false, error: null }));
      onSuccess?.(forked);
      return forked;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: errorObj }));
      onError?.(errorObj);
      return null;
    }
  }, [id, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (refetchOnMount) {
      fetchPrototype();
    }
  }, [fetchPrototype, refetchOnMount]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled || !id) {
      return;
    }

    const interval = setInterval(fetchPrototype, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchPrototype, refetchInterval, enabled, id]);

  // Subscribe to prototype events
  useEffect(() => {
    if (!id) {
      return;
    }

    const handleUpdated = (data: PrototypeEvents['prototype:updated']) => {
      if (data.prototype.id === id) {
        setState(prev => ({ ...prev, data: data.prototype }));
      }
    };

    const handleDeleted = (data: PrototypeEvents['prototype:deleted']) => {
      if (data.id === id) {
        setState(prev => ({ ...prev, data: null }));
      }
    };

    PrototypeService.on('prototype:updated', handleUpdated);
    PrototypeService.on('prototype:deleted', handleDeleted);

    return () => {
      PrototypeService.off('prototype:updated', handleUpdated);
      PrototypeService.off('prototype:deleted', handleDeleted);
    };
  }, [id]);

  return {
    ...state,
    refetch: fetchPrototype,
    update,
    delete: deletePrototype,
    fork
  };
}

/**
 * Hook for querying multiple prototypes
 */
export function usePrototypeQuery(
  filters?: PrototypeQueryFilters,
  sort?: PrototypeSortOptions,
  options: UsePrototypeOptions & { limit?: number } = {}
): UsePrototypeQueryResult {
  const { onSuccess, onError, enabled = true, refetchOnMount = true, limit = 20 } = options;

  const [state, setState] = useState<UsePrototypeQueryState>({
    data: null,
    loading: enabled,
    error: null
  });

  const [offset, setOffset] = useState(0);

  // Create stable filter and sort objects
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  const stableSort = useMemo(() => sort, [JSON.stringify(sort)]);

  // Fetch function
  const fetchPrototypes = useCallback(async (isLoadMore = false) => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const currentOffset = isLoadMore ? offset : 0;
      const result = await PrototypeService.query(stableFilters, stableSort, limit, currentOffset);
      
      setState(prev => ({
        data: isLoadMore && prev.data ? {
          ...result,
          prototypes: [...prev.data.prototypes, ...result.prototypes]
        } : result,
        loading: false,
        error: null
      }));

      if (!isLoadMore) {
        setOffset(limit);
      } else {
        setOffset(prev => prev + limit);
      }

      onSuccess?.(result);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: errorObj }));
      onError?.(errorObj);
    }
  }, [enabled, stableFilters, stableSort, limit, offset, onSuccess, onError]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (state.data && state.data.hasMore && !state.loading) {
      await fetchPrototypes(true);
    }
  }, [fetchPrototypes, state.data, state.loading]);

  // Reset and refetch
  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchPrototypes(false);
  }, [fetchPrototypes]);

  // Initial fetch
  useEffect(() => {
    if (refetchOnMount) {
      refetch();
    }
  }, [refetch, refetchOnMount]);

  // Reset when filters change
  useEffect(() => {
    setOffset(0);
    if (enabled) {
      fetchPrototypes(false);
    }
  }, [stableFilters, stableSort, enabled, limit]);

  // Subscribe to relevant events
  useEffect(() => {
    const handleCreated = () => {
      refetch();
    };

    const handleUpdated = (data: PrototypeEvents['prototype:updated']) => {
      setState(prev => {
        if (!prev.data) return prev;
        
        const updatedPrototypes = prev.data.prototypes.map(p => 
          p.id === data.prototype.id ? data.prototype : p
        );
        
        return {
          ...prev,
          data: { ...prev.data, prototypes: updatedPrototypes }
        };
      });
    };

    const handleDeleted = (data: PrototypeEvents['prototype:deleted']) => {
      setState(prev => {
        if (!prev.data) return prev;
        
        const filteredPrototypes = prev.data.prototypes.filter(p => p.id !== data.id);
        
        return {
          ...prev,
          data: { 
            ...prev.data, 
            prototypes: filteredPrototypes,
            total: prev.data.total - 1
          }
        };
      });
    };

    PrototypeService.on('prototype:created', handleCreated);
    PrototypeService.on('prototype:updated', handleUpdated);
    PrototypeService.on('prototype:deleted', handleDeleted);

    return () => {
      PrototypeService.off('prototype:created', handleCreated);
      PrototypeService.off('prototype:updated', handleUpdated);
      PrototypeService.off('prototype:deleted', handleDeleted);
    };
  }, [refetch]);

  return {
    ...state,
    refetch,
    loadMore,
    hasMore: state.data?.hasMore || false,
    total: state.data?.total || 0
  };
}

/**
 * Hook for creating prototypes
 */
export function usePrototypeCreate(options: UsePrototypeOptions = {}): UsePrototypeCreateResult {
  const { onSuccess, onError } = options;

  const [state, setState] = useState({
    loading: false,
    error: null as Error | null
  });

  const create = useCallback(async (input: CreatePrototypeInput): Promise<Prototype | null> => {
    setState({ loading: true, error: null });

    try {
      const prototype = await PrototypeService.create(input);
      setState({ loading: false, error: null });
      onSuccess?.(prototype);
      return prototype;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ loading: false, error: errorObj });
      onError?.(errorObj);
      return null;
    }
  }, [onSuccess, onError]);

  return {
    create,
    loading: state.loading,
    error: state.error
  };
}

/**
 * Hook for searching prototypes
 */
export function usePrototypeSearch(
  searchTerm: string,
  filters?: Omit<PrototypeQueryFilters, 'search'>,
  options: UsePrototypeOptions & { debounceMs?: number } = {}
): UsePrototypeQueryResult {
  const { debounceMs = 300, ...queryOptions } = options;
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Use query hook with search filter
  const searchFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined
  }), [filters, debouncedSearchTerm]);

  return usePrototypeQuery(searchFilters, undefined, {
    ...queryOptions,
    enabled: queryOptions.enabled !== false && !!debouncedSearchTerm
  });
}

/**
 * Hook for prototype statistics
 */
export function usePrototypeStats(options: UsePrototypeOptions = {}) {
  const { onSuccess, onError, enabled = true, refetchInterval } = options;

  const [state, setState] = useState<{
    data: any | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: enabled,
    error: null
  });

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await PrototypeService.getStats();
      setState({ data: stats, loading: false, error: null });
      onSuccess?.(stats);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: errorObj });
      onError?.(errorObj);
    }
  }, [enabled, onSuccess, onError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!refetchInterval || !enabled) {
      return;
    }

    const interval = setInterval(fetchStats, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refetchInterval, enabled]);

  return {
    ...state,
    refetch: fetchStats
  };
}