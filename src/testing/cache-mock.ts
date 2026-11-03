/**
 * Cache mock utilities for testing
 */
import { vi, type Mocked } from 'vitest';
import { CacheStorage } from '../gh-cache-storage';

/**
 * Creates a mocked CacheStorage instance
 */
export function createCacheMock(): Mocked<CacheStorage> {
  return {
    get: vi.fn(),
    add: vi.fn(),
    clearExpiredEntries: vi.fn(),
  } as any;
}

/**
 * Sets up cache mock with no cached data
 */
export function setupEmptyCache(mockCache: Mocked<CacheStorage>): void {
  mockCache.get.mockReturnValue(undefined);
}

/**
 * Sets up cache mock with cached data
 */
export function setupCacheWithData(
  mockCache: Mocked<CacheStorage>,
  url: string,
  data: any,
  lastModified: string = 'Mon, 18 Mar 2019 20:40:35 GMT',
): void {
  mockCache.get.mockImplementation((requestedUrl: string) => {
    if (requestedUrl === url) {
      return {
        lastModified,
        data,
      };
    }
    return undefined;
  });
}

/**
 * Resets all cache mock calls
 */
export function resetCacheMock(mockCache: Mocked<CacheStorage>): void {
  mockCache.get.mockClear();
  mockCache.add.mockClear();
  mockCache.clearExpiredEntries.mockClear();
}
