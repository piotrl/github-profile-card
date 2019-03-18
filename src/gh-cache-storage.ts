interface ICache {
    [url: string]: ICacheEntry;
}

interface ICacheEntry {
    lastModified: string;
    data: any;
}

export class CacheStorage {
    private cacheName: string = 'github-request-cache';
    private requestCache: ICache = this.getCache() || {};

    public get(key: string): ICacheEntry {
        return this.requestCache[key];
    }

    public add(url: string, entry: ICacheEntry): void {
        this.requestCache[url] = entry;

        window.localStorage.setItem(this.cacheName, JSON.stringify(this.requestCache));
    }

    private getCache(): ICache {
        return JSON.parse(window.localStorage.getItem(this.cacheName));
    }
}
