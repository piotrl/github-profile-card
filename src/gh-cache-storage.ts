import { BrowserStorage } from './interface/storage';

interface Cache {
  [url: string]: CacheEntry;
}

export interface CacheEntry {
  lastModified: string;
  data: object;
}

export class CacheStorage {
  private cacheName = 'github-request-cache';
  private requestCache: Cache = this.getCache() || {};

  constructor(private readonly storage: BrowserStorage) {}

  public get(key: string): CacheEntry {
    return this.requestCache[key];
  }

  public add(url: string, entry: CacheEntry): void {
    this.requestCache[url] = entry;

    this.storage.setItem(this.cacheName, JSON.stringify(this.requestCache));
  }

  private getCache(): Cache {
    return JSON.parse(this.storage.getItem(this.cacheName));
  }
}
