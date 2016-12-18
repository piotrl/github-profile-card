interface ICache {
    [url: string]: ICacheEntry;
}

interface ICacheEntry {
    lastModified: string;
    data: any;
}

class CacheStorage {
    private static cacheName: string = 'github-request-cache';
    private static requestCache: ICache = CacheStorage.getCache() || {};

    public static get(key: string): ICacheEntry {
        return CacheStorage.requestCache[key];
    }

    public static add(url: string, entry: ICacheEntry): void {
        CacheStorage.requestCache[url] = entry;

        window.localStorage.setItem(CacheStorage.cacheName, JSON.stringify(CacheStorage.requestCache));
    }

    private static getCache(): ICache {
        return JSON.parse(window.localStorage.getItem(CacheStorage.cacheName));
    }
}
