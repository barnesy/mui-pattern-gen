import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CachedData {
  data: any;
  timestamp: number;
  ttl?: number;
}

interface DataStoreState {
  // Cache storage
  cache: Map<string, CachedData>;

  // Event subscriptions
  subscriptions: Map<string, Set<() => void>>;

  // Pending requests for deduplication
  pending: Map<string, Promise<any>>;
}

interface DataStoreActions {
  // Cache management
  getCached: (key: string) => any | null;
  setCached: (key: string, data: any, ttl?: number) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;

  // Request deduplication
  dedupe: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;

  // Event subscriptions
  subscribe: (event: string, callback: () => void) => () => void;
  emit: (event: string) => void;

  // Cache utilities
  clearExpired: () => void;
  getCacheSize: () => number;
}

type DataStore = DataStoreState & DataStoreActions;

export const useDataStore = create<DataStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      cache: new Map(),
      subscriptions: new Map(),
      pending: new Map(),

      // Get cached data if not expired
      getCached: (key: string) => {
        const cached = get().cache.get(key);
        if (!cached) {return null;}

        const { data, timestamp, ttl } = cached;

        // Check if expired
        if (ttl && Date.now() - timestamp > ttl) {
          // Remove expired entry
          set((state) => {
            const newCache = new Map(state.cache);
            newCache.delete(key);
            return { cache: newCache };
          });
          return null;
        }

        return data;
      },

      // Set cached data
      setCached: (key: string, data: any, ttl?: number) => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
          });
          return { cache: newCache };
        });
      },

      // Invalidate specific cache entry
      invalidate: (key: string) => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.delete(key);
          return { cache: newCache };
        });
      },

      // Invalidate all cache entries
      invalidateAll: () => {
        set({ cache: new Map() });
      },

      // Request deduplication
      dedupe: async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
        const pending = get().pending.get(key);

        if (pending) {
          // Return existing promise
          return pending as Promise<T>;
        }

        // Create new promise
        const promise = fetcher().finally(() => {
          // Remove from pending when complete
          set((state) => {
            const newPending = new Map(state.pending);
            newPending.delete(key);
            return { pending: newPending };
          });
        });

        // Add to pending
        set((state) => {
          const newPending = new Map(state.pending);
          newPending.set(key, promise);
          return { pending: newPending };
        });

        return promise;
      },

      // Subscribe to events
      subscribe: (event: string, callback: () => void) => {
        set((state) => {
          const newSubscriptions = new Map(state.subscriptions);
          const callbacks = newSubscriptions.get(event) || new Set();
          callbacks.add(callback);
          newSubscriptions.set(event, callbacks);
          return { subscriptions: newSubscriptions };
        });

        // Return unsubscribe function
        return () => {
          set((state) => {
            const newSubscriptions = new Map(state.subscriptions);
            const callbacks = newSubscriptions.get(event);
            if (callbacks) {
              callbacks.delete(callback);
              if (callbacks.size === 0) {
                newSubscriptions.delete(event);
              }
            }
            return { subscriptions: newSubscriptions };
          });
        };
      },

      // Emit event to all subscribers
      emit: (event: string) => {
        const callbacks = get().subscriptions.get(event);
        if (callbacks) {
          callbacks.forEach((callback) => callback());
        }
      },

      // Clear expired cache entries
      clearExpired: () => {
        set((state) => {
          const newCache = new Map<string, CachedData>();
          const now = Date.now();

          state.cache.forEach((cached, key) => {
            if (!cached.ttl || now - cached.timestamp <= cached.ttl) {
              newCache.set(key, cached);
            }
          });

          return { cache: newCache };
        });
      },

      // Get cache size
      getCacheSize: () => {
        return get().cache.size;
      },
    }),
    {
      name: 'data-store',
    }
  )
);

// Auto-clear expired cache entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    useDataStore.getState().clearExpired();
  }, 60000);
}

// Export convenience functions
export const invalidateCache = (key: string) => useDataStore.getState().invalidate(key);
export const invalidateAllCache = () => useDataStore.getState().invalidateAll();
export const emitDataEvent = (event: string) => useDataStore.getState().emit(event);
