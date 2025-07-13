import { CacheStorage, CacheEntry } from './gh-cache-storage';
import { InMemoryStorage } from './testing/in-memory-storage';
import { BrowserStorage } from './interface/storage';

describe('CacheStorage', () => {
  const url =
    'https://api.github.com/repos/piotrl/github-profile-card/languages';
  const cacheData: CacheEntry = {
    lastModified: 'Mon, 18 Mar 2019 20:40:35 GMT',
    data: {
      TypeScript: 19766,
      CSS: 3790,
      JavaScript: 1350,
    },
  };

  let storage: BrowserStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('basic functionality', () => {
    it('should be undefined on empty init', () => {
      const cache = new CacheStorage(storage);

      const result = cache.get('not-defined');

      expect(result).toBeUndefined();
    });

    it('should return back saved value', () => {
      const cache = new CacheStorage(storage);

      cache.add(url, cacheData);
      const result = cache.get(url);

      expect(result).toEqual(cacheData);
    });

    it('should initialize with existing entries', () => {
      const cacheName = 'github-request-cache';
      storage.setItem(
        cacheName,
        JSON.stringify({
          [url]: cacheData,
        }),
      );
      const cache = new CacheStorage(storage);

      const result = cache.get(url);

      expect(result).toEqual(cacheData);
    });
  });

  describe('error handling', () => {
    it('should handle corrupted cache data gracefully', () => {
      const cacheName = 'github-request-cache';
      storage.setItem(cacheName, 'invalid-json');

      // Should not throw
      const cache = new CacheStorage(storage);
      const result = cache.get(url);

      expect(result).toBeUndefined();
    });

    it('should handle null cache data', () => {
      const mockStorage: BrowserStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      const cache = new CacheStorage(mockStorage);
      const result = cache.get(url);

      expect(result).toBeUndefined();
    });

    it('should handle non-object cache data', () => {
      const cacheName = 'github-request-cache';
      storage.setItem(cacheName, '"string-instead-of-object"');

      const cache = new CacheStorage(storage);
      const result = cache.get(url);

      expect(result).toBeUndefined();
    });

    it('should clear corrupted cache on initialization error', () => {
      const mockStorage: BrowserStorage = {
        getItem: jest.fn().mockReturnValue('invalid-json'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      new CacheStorage(mockStorage);

      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        'github-request-cache',
      );
    });

    it('should handle storage errors during save', () => {
      const mockStorage: BrowserStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('Storage full');
        }),
        removeItem: jest.fn(),
      };

      const cache = new CacheStorage(mockStorage);

      // Should not throw
      expect(() => cache.add(url, cacheData)).not.toThrow();
    });

    it('should retry save after clearing expired entries on storage error', () => {
      let callCount = 0;
      const mockStorage: BrowserStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Storage full');
          }
          // Second call succeeds
        }),
        removeItem: jest.fn(),
      };

      const cache = new CacheStorage(mockStorage);
      cache.add(url, cacheData);

      expect(mockStorage.setItem).toHaveBeenCalledTimes(3); // Initial call + retry + potential success
    });
  });

  describe('clearExpiredEntries', () => {
    it('should clear expired entries', () => {
      const cache = new CacheStorage(storage);
      const oldEntry: CacheEntry = {
        lastModified: 'Mon, 01 Jan 2020 00:00:00 GMT',
        data: { test: 'old' },
      };
      const recentEntry: CacheEntry = {
        lastModified: 'Mon, 01 Jan 2024 00:00:00 GMT',
        data: { test: 'recent' },
      };

      cache.add('old-url', oldEntry);
      cache.add('recent-url', recentEntry);

      const cutoffDate = new Date('2022-01-01');
      cache.clearExpiredEntries(cutoffDate);

      expect(cache.get('old-url')).toBeUndefined();
      expect(cache.get('recent-url')).toEqual(recentEntry);
    });

    it('should not save when no entries are expired', () => {
      const mockStorage: BrowserStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      const cache = new CacheStorage(mockStorage);
      const recentEntry: CacheEntry = {
        lastModified: 'Mon, 01 Jan 2024 00:00:00 GMT',
        data: { test: 'recent' },
      };

      cache.add('recent-url', recentEntry);
      jest.clearAllMocks(); // Clear the setItem call from add()

      const cutoffDate = new Date('2020-01-01');
      cache.clearExpiredEntries(cutoffDate);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle entries without lastModified date', () => {
      const cache = new CacheStorage(storage);
      const entryWithoutDate: CacheEntry = {
        lastModified: undefined as string,
        data: { test: 'data' },
      };

      cache.add('test-url', entryWithoutDate);

      const cutoffDate = new Date();

      // Should not throw
      expect(() => cache.clearExpiredEntries(cutoffDate)).not.toThrow();
    });

    it('should handle invalid date strings in lastModified', () => {
      const cache = new CacheStorage(storage);
      const entryWithInvalidDate: CacheEntry = {
        lastModified: 'invalid-date-string',
        data: { test: 'data' },
      };

      cache.add('test-url', entryWithInvalidDate);

      const cutoffDate = new Date();

      // Should not throw and should clear invalid entries
      expect(() => cache.clearExpiredEntries(cutoffDate)).not.toThrow();
      expect(cache.get('test-url')).toBeUndefined();
    });
  });

  describe('performance', () => {
    it('should handle large cache efficiently', () => {
      const cache = new CacheStorage(storage);
      const entries = 1000;

      // Add many entries
      for (let i = 0; i < entries; i++) {
        cache.add(`url-${i}`, {
          lastModified: 'Mon, 18 Mar 2019 20:40:35 GMT',
          data: { index: i },
        });
      }

      // Should be able to retrieve any entry quickly
      const result = cache.get('url-500');
      expect(result?.data).toEqual({ index: 500 });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as URL', () => {
      const cache = new CacheStorage(storage);

      cache.add('', cacheData);
      const result = cache.get('');

      expect(result).toEqual(cacheData);
    });

    it('should handle special characters in URLs', () => {
      const cache = new CacheStorage(storage);
      const specialUrl =
        'https://api.github.com/repos/user/repo?param=value&other=ção';

      cache.add(specialUrl, cacheData);
      const result = cache.get(specialUrl);

      expect(result).toEqual(cacheData);
    });

    it('should handle data with circular references', () => {
      const cache = new CacheStorage(storage);
      const circularData: any = { test: 'data' };
      circularData.self = circularData;

      const entry: CacheEntry = {
        lastModified: 'Mon, 18 Mar 2019 20:40:35 GMT',
        data: circularData,
      };

      // Should handle JSON.stringify error gracefully
      expect(() => cache.add(url, entry)).not.toThrow();
    });
  });
});
