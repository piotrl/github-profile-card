/**
 * Cache mock utilities for testing
 */
import { CacheStorage } from '../gh-cache-storage';

/**
 * Creates a mocked CacheStorage instance
 */
export function createCacheMock(): jest.Mocked<CacheStorage> {
  return {
    get: jest.fn(),
    add: jest.fn(),
    clearExpiredEntries: jest.fn(),
  } as any;
}

/**
 * Sets up cache mock with no cached data
 */
export function setupEmptyCache(mockCache: jest.Mocked<CacheStorage>): void {
  mockCache.get.mockReturnValue(undefined);
}
