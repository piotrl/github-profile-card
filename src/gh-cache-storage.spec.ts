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

  it('should be undefined on empty init', () => {
    // given
    const cache = new CacheStorage(storage);

    // when
    const result = cache.get('not-defined');

    // then
    expect(result).toBeUndefined();
  });

  it('should return back saved value', () => {
    // given
    const cache = new CacheStorage(storage);

    // when
    cache.add(url, cacheData);
    const result = cache.get(url);

    // then
    expect(result).toEqual(cacheData);
  });

  it('should initialize with existing entries', () => {
    // given
    const cacheName = 'github-request-cache';
    storage.setItem(
      cacheName,
      JSON.stringify({
        [url]: cacheData,
      }),
    );
    const cache = new CacheStorage(storage);

    // when
    const result = cache.get(url);

    // then
    expect(result).toEqual(cacheData);
  });
});
