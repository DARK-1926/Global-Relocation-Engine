/**
 * In-memory cache with 60-minute TTL and request deduplication.
 * - Cached entries expire after 60 minutes.
 * - Concurrent identical requests share a single in-flight promise (dedup).
 * - Error responses are never cached.
 * - Provides cache hit/miss metadata.
 */

import logger from './logger.js';

const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

interface CacheEntry {
    data: any;
    timestamp: number;
}

class Cache {
    private store: Map<string, CacheEntry> = new Map();
    private inflight: Map<string, Promise<any>> = new Map();

    /**
     * Get cached data if it exists and hasn't expired.
     */
    get(key: string): { data: any; hit: boolean } {
        const entry = this.store.get(key);
        if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
            logger.cacheEvent(key, true);
            return { data: entry.data, hit: true };
        }
        if (entry) {
            this.store.delete(key); // expired
        }
        logger.cacheEvent(key, false);
        return { data: null, hit: false };
    }

    /**
     * Store data in cache.
     */
    set(key: string, data: any): void {
        this.store.set(key, { data, timestamp: Date.now() });
    }

    /**
     * Execute a fetch function with deduplication and caching.
     * If the same key is requested concurrently, only one fetch runs.
     * Errors are NOT cached.
     */
    async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<{ data: T; cacheStatus: 'hit' | 'miss' }> {
        // Check cache first
        const cached = this.get(key);
        if (cached.hit) {
            return { data: cached.data as T, cacheStatus: 'hit' };
        }

        // Check for in-flight request (deduplication)
        if (this.inflight.has(key)) {
            logger.info('CACHE', `Dedup: joining in-flight request for ${key}`);
            const data = await this.inflight.get(key);
            return { data, cacheStatus: 'hit' };
        }

        // Create new fetch promise
        const fetchPromise = (async () => {
            try {
                const data = await fetchFn();
                this.set(key, data); // Cache successful result
                return data;
            } catch (error) {
                // Do NOT cache errors
                throw error;
            } finally {
                this.inflight.delete(key);
            }
        })();

        this.inflight.set(key, fetchPromise);
        const data = await fetchPromise;
        return { data, cacheStatus: 'miss' };
    }

    /**
     * Get cache statistics.
     */
    getStats(): { entries: number; inflightRequests: number } {
        return {
            entries: this.store.size,
            inflightRequests: this.inflight.size
        };
    }
}

const cache = new Cache();
export default cache;
