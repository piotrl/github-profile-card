import { BrowserStorage } from './interface/storage';

interface Cache {
  [url: string]: CacheEntry;
}

export interface CacheEntry {
  lastModified: string;
  data: any;
}

export class CacheStorage {
  private cacheName = 'github-request-cache';
  private requestCache: Cache = this.initializeCache();

  constructor(private readonly storage: BrowserStorage) {}

  public get(key: string): CacheEntry | undefined {
    return this.requestCache[key];
  }

  public add(url: string, entry: CacheEntry): void {
    this.requestCache[url] = entry;
    this.saveCache();
  }

  private initializeCache(): Cache {
    try {
      const cacheData = this.storage.getItem(this.cacheName);
      if (!cacheData) {
        return {};
      }
      
      const cache = JSON.parse(cacheData);
      return cache && typeof cache === 'object' ? cache : {};
    } catch (error) {
      console.error('Failed to parse cache:', error);
      // Clear corrupted cache data
      try {
        this.storage.removeItem(this.cacheName);
      } catch (cleanupError) {
        console.error('Failed to clear corrupted cache:', cleanupError);
      }
      return {};
    }
  }

  private saveCache(): void {
    try {
      this.storage.setItem(this.cacheName, JSON.stringify(this.requestCache));
    } catch (error) {
      console.error('Failed to save cache:', error);
      // If storage is full, try to clear expired entries and retry
      this.clearExpiredEntries(new Date());
      try {
        this.storage.setItem(this.cacheName, JSON.stringify(this.requestCache));
      } catch (retryError) {
        console.error('Failed to save cache after cleanup:', retryError);
      }
    }
  }

  public clearExpiredEntries(currentDate: Date): void {
    let hasChanges = false;
    
    for (const [url, entry] of Object.entries(this.requestCache)) {
      if (entry.lastModified) {
        const entryDate = new Date(entry.lastModified);
        // Clear entries with invalid dates or expired entries
        if (isNaN(entryDate.getTime()) || entryDate < currentDate) {
          delete this.requestCache[url];
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges) {
      this.saveCache();
    }
  }
}