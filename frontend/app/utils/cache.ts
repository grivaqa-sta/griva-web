// FEATURE: Client-Side Caching Mechanism
// File: frontend/app/utils/cache.ts
// Do not modify without checking project docs

import { useState, useEffect, useCallback } from "react";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type Listener = (data: any) => void;

class CustomQueryClient {
  private cache = new Map<string, CacheEntry<any>>();
  private listeners = new Map<string, Set<Listener>>();
  private pendingPromises = new Map<string, Promise<any>>();
  private ttl = 5 * 60 * 1000; // 5 minutes cache TTL

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.notify(key, data);
  }

  // Deduplicate active parallel requests
  async fetch<T>(key: string, fetchFn: () => Promise<T>, force = false): Promise<T> {
    if (!force) {
      const cached = this.get<T>(key);
      if (cached !== null) return cached;
    }

    let promise = this.pendingPromises.get(key);
    if (promise) {
      return promise;
    }

    promise = fetchFn()
      .then((data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.notify(key, data);
        this.pendingPromises.delete(key);
        return data;
      })
      .catch((err) => {
        this.pendingPromises.delete(key);
        throw err;
      });

    this.pendingPromises.set(key, promise);
    return promise;
  }

  subscribe(key: string, listener: Listener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notify(key: string, data: any) {
    const set = this.listeners.get(key);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error(`Error in cache listener for key ${key}:`, e);
        }
      });
    }
  }

  invalidate(keyPattern?: string) {
    if (keyPattern) {
      for (const key of Array.from(this.cache.keys())) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const queryClient = new CustomQueryClient();

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
}

export function useQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseQueryResult<T> {
  const cachedData = queryClient.get<T>(key);
  const [data, setData] = useState<T | null>(cachedData);
  const [loading, setLoading] = useState(cachedData === null);
  const [error, setError] = useState<string | null>(null);

  // Sync state variables immediately when key changes
  useEffect(() => {
    const freshCached = queryClient.get<T>(key);
    setData(freshCached);
    setLoading(freshCached === null);
    setError(null);
  }, [key]);

  const executeFetch = useCallback(async (force = false) => {
    if (queryClient.get(key) === null || force) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await queryClient.fetch<T>(key, fetchFn, force);
      setData(res);
      return res;
    } catch (err: any) {
      console.error(`[useQuery] Error fetching key "${key}":`, err);
      setError(err?.message || "Failed to load data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [key, ...dependencies]);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = queryClient.subscribe(key, (updatedData) => {
      setData(updatedData);
      setLoading(false);
    });
    return unsubscribe;
  }, [key]);

  // Trigger initial fetch if not cached
  useEffect(() => {
    const cached = queryClient.get<T>(key);
    if (cached === null) {
      executeFetch();
    }
  }, [executeFetch, key]);

  return { data, loading, error, refetch: () => executeFetch(true) };
}
