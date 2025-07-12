import { CacheStorage } from '../gh-cache-storage';
import { GitHubApiLoader } from '../gh-data-loader';
import { createCacheMock, setupEmptyCache } from './cache-mock';
import { setupFetchMock, resetFetchMock } from './fetch-mock';

jest.mock('../gh-cache-storage');
const MockCacheStorage = CacheStorage as jest.MockedClass<typeof CacheStorage>;

export function setupTestEnvironment(): {
  loader: GitHubApiLoader;
  mockCache: jest.Mocked<CacheStorage>;
} {
  setupFetchMock();
  
  const mockCache = createCacheMock();
  MockCacheStorage.mockImplementation(() => mockCache);
  setupEmptyCache(mockCache);
  
  const loader = new GitHubApiLoader();
  
  return { loader, mockCache };
}

export function cleanupTestEnvironment(): void {
  jest.clearAllMocks();
  resetFetchMock();
}

export function setupTestDOM(html: string): void {
  document.body.innerHTML = html;
}

export function setupCommonTestHooks(): {
  getLoader: () => GitHubApiLoader;
  getMockCache: () => jest.Mocked<CacheStorage>;
} {
  let loader: GitHubApiLoader;
  let mockCache: jest.Mocked<CacheStorage>;

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
