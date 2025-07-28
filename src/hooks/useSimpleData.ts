import { useState, useEffect } from 'react';
import { DataSourceSchema } from '../schemas/types';

export interface UseSimpleDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Simple data fetching hook - replaces the complex useSchemaData
 */
export function useSimpleData<T = any>(dataSource?: DataSourceSchema): UseSimpleDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!dataSource?.endpoint) {return;}

    setLoading(true);
    setError(null);

    try {
      let result: any;

      // Handle different data source types
      if (dataSource.type === 'static') {
        // Static data - endpoint is the data itself
        result = dataSource.endpoint;
      } else if (dataSource.type === 'rest' || dataSource.type === 'graphql') {
        // HTTP request
        const response = await fetch(dataSource.endpoint, {
          method: dataSource.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...dataSource.headers,
          },
          body: dataSource.method !== 'GET' ? JSON.stringify(dataSource.query) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        result = await response.json();
      } else {
        // Fallback - try to parse as JSON or return as string
        try {
          result =
            typeof dataSource.endpoint === 'string'
              ? JSON.parse(dataSource.endpoint)
              : dataSource.endpoint;
        } catch {
          result = dataSource.endpoint;
        }
      }

      setData(result);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
    }
  };

  // Effect to fetch data when dataSource changes
  useEffect(() => {
    if (dataSource) {
      fetchData();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [dataSource?.endpoint, dataSource?.type, dataSource?.method]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}
