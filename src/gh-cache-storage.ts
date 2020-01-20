import { BrowserStorage } from './interface/storage';

interface ICache {
  [url: string]: ICacheEntry;
}

export interface ICacheEntry {
  lastModified: string;
  data: any;
}

export class CacheStorage {
  private cacheName: string = 'github-request-cache';
  private requestCache: ICache = this.getCache() || {};

  constructor(private readonly storage: BrowserStorage) {}

  public get(key: string): ICacheEntry {
    return this.requestCache[key];
  }

  public add(url: string, entry: ICacheEntry): void {
    this.requestCache[url] = entry;

    this.storage.setItem(this.cacheName, JSON.stringify(this.requestCache));
  }

  private getCache(): ICache {
    return JSON.parse(this.storage.getItem(this.cacheName));
  }
}
