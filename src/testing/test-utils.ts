import {
  afterEach,
  beforeEach,
  vi,
  type Mocked,
  type MockedClass,
} from 'vitest';
import { CacheStorage } from '../gh-cache-storage';
import { GitHubApiLoader } from '../gh-data-loader';
import { createCacheMock, setupEmptyCache } from './cache-mock';
import { setupFetchMock, resetFetchMock } from './fetch-mock';

vi.mock('../gh-cache-storage');
const MockCacheStorage = CacheStorage as MockedClass<typeof CacheStorage>;

export function setupTestEnvironment(): {
  loader: GitHubApiLoader;
  mockCache: Mocked<CacheStorage>;
} {
  setupFetchMock();

  const mockCache = createCacheMock();
  MockCacheStorage.mockImplementation(function () {
    return mockCache;
  });
  setupEmptyCache(mockCache);

  const loader = new GitHubApiLoader();

  return { loader, mockCache };
}

export function cleanupTestEnvironment(): void {
  vi.clearAllMocks();
  resetFetchMock();
}

export function setupTestDOM(html: string): void {
  document.body.innerHTML = html;
}

export function setupCommonTestHooks(): {
  getLoader: () => GitHubApiLoader;
  getMockCache: () => Mocked<CacheStorage>;
} {
  let loader: GitHubApiLoader;
  let mockCache: Mocked<CacheStorage>;

  beforeEach(() => {
    const env = setupTestEnvironment();
    loader = env.loader;
    mockCache = env.mockCache;
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  return {
    getLoader: () => loader,
    getMockCache: () => mockCache,
  };
}
