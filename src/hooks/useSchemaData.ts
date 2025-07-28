import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DataSourceSchema, DataShape } from '../schemas/types';
import { parseData } from '../schemas/validation';
import { useDataStore } from '../stores/dataStore';

export interface UseSchemaDataOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  refetchInterval?: number;
  initialData?: any;
}

export interface UseSchemaDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => void;
  invalidate: () => void;
}

/**
 * Hook to fetch and validate data based on schema
 */
export function useSchemaData<T = any>(
  dataSource: DataSourceSchema | undefined,
  dataShape: DataShape | undefined,
  options: UseSchemaDataOptions = {}
): UseSchemaDataResult<T> {
  const { onSuccess, onError, enabled = true, refetchInterval, initialData = null } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: initialData,
    loading: enabled && !!dataSource,
    error: null,
  });

  const dataStore = useDataStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate cache key
  const cacheKey = useMemo(() => {
    if (!dataSource) {return null;}
    return JSON.stringify({
      id: dataSource.id,
      endpoint: dataSource.endpoint,
      method: dataSource.method,
      query: dataSource.query,
    });
  }, [dataSource]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!dataSource || !enabled) {return;}

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let rawData: any;

      // Check cache first
      if (cacheKey && dataSource.cache?.enabled) {
        const cached = dataStore.getCached(cacheKey);
        if (cached) {
          rawData = cached;
        }
      }

      // Fetch if not cached
      if (!rawData) {
        switch (dataSource.type) {
          case 'rest':
            rawData = await fetchRestData(dataSource, abortControllerRef.current.signal);
            break;
          case 'graphql':
            rawData = await fetchGraphQLData(dataSource, abortControllerRef.current.signal);
            break;
          case 'static':
            // For static data, the endpoint contains the data itself
            if (dataSource.endpoint) {
              try {
                // Try to parse as JSON first
                rawData = JSON.parse(dataSource.endpoint);
              } catch {
                // If not JSON, try to import as module
                if (dataSource.endpoint.startsWith('/') || dataSource.endpoint.startsWith('.')) {
                  rawData = await import(dataSource.endpoint).then((m) => m.default);
                } else {
                  // Otherwise use as-is
                  rawData = dataSource.endpoint;
                }
              }
            } else {
              rawData = {};
            }
            break;
          case 'computed':
            // Computed data sources are handled by parent components
            rawData = {};
            break;
          default:
            throw new Error(`Unknown data source type: ${dataSource.type}`);
        }

        // Apply transform if provided
        if (dataSource.transform) {
          try {
            // Create a safe transform function
            const transformFn = new Function(
              'data',
              `
              try {
                ${dataSource.transform}
              } catch (e) {
                console.error('Transform error:', e);
                return data;
              }
            `
            );
            rawData = transformFn(rawData);
          } catch (error) {
            console.error('Failed to create transform function:', error);
          }
        }

        // Cache the data
        if (cacheKey && dataSource.cache?.enabled) {
          dataStore.setCached(cacheKey, rawData, dataSource.cache.ttl);
        }
      }

      // Validate and parse data if shape is provided
      let parsedData: T;
      if (dataShape) {
        parsedData = parseData<T>(rawData, dataShape);
      } else {
        parsedData = rawData as T;
      }

      setState({
        data: parsedData,
        loading: false,
        error: null,
      });

      onSuccess?.(parsedData);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled
        return;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({
        data: null,
        loading: false,
        error: errorObj,
      });

      onError?.(errorObj);
    }
  }, [dataSource, dataShape, enabled, cacheKey, dataStore, onSuccess, onError]);

  // Set up effect for initial fetch and refetch interval
  useEffect(() => {
    if (!dataSource || !enabled) {return;}

    // Initial fetch
    fetchData();

    // Set up refetch interval
    if (refetchInterval || dataSource.refresh?.interval) {
      const interval = refetchInterval || dataSource.refresh!.interval!;
      intervalRef.current = setInterval(fetchData, interval);
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, dataSource, enabled, refetchInterval]);

  // Subscribe to cache invalidation events
  useEffect(() => {
    if (!cacheKey || !dataSource?.refresh?.events) {return;}

    const unsubscribers = dataSource.refresh.events.map((event) =>
      dataStore.subscribe(event, () => {
        fetchData();
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [cacheKey, dataSource, fetchData, dataStore]);

  // Refetch function
  const refetch = useCallback(async () => {
    if (cacheKey) {
      dataStore.invalidate(cacheKey);
    }
    await fetchData();
  }, [cacheKey, dataStore, fetchData]);

  // Retry function (alias for refetch)
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Invalidate function
  const invalidate = useCallback(() => {
    if (cacheKey) {
      dataStore.invalidate(cacheKey);
    }
  }, [cacheKey, dataStore]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
    retry,
    invalidate,
  };
}

// Helper functions for different data source types

async function fetchRestData(dataSource: DataSourceSchema, signal: AbortSignal): Promise<any> {
  if (!dataSource.endpoint) {
    throw new Error('REST data source requires an endpoint');
  }

  const response = await fetch(dataSource.endpoint, {
    method: dataSource.method || 'GET',
    headers: dataSource.headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function fetchGraphQLData(dataSource: DataSourceSchema, signal: AbortSignal): Promise<any> {
  if (!dataSource.endpoint || !dataSource.query) {
    throw new Error('GraphQL data source requires endpoint and query');
  }

  const response = await fetch(dataSource.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...dataSource.headers,
    },
    body: JSON.stringify({
      query: dataSource.query,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

/**
 * Hook for computed data that depends on other data sources
 */
export function useComputedData<T, R>(
  dataSource: DataSourceSchema | undefined,
  compute: (data: T) => R,
  deps: any[] = []
): UseSchemaDataResult<R> {
  const { data, ...rest } = useSchemaData<T>(dataSource);

  const computedData = useMemo(() => {
    if (!data) {return null;}
    try {
      return compute(data);
    } catch (error) {
      console.error('Error computing data:', error);
      return null;
    }
  }, [data, compute, ...deps]);

  return {
    ...rest,
    data: computedData,
  };
}
