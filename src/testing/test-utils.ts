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
