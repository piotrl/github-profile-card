/**
 * Common test utilities and setup functions
 */
import { CacheStorage } from '../gh-cache-storage';
import { GitHubApiLoader } from '../gh-data-loader';
import { createCacheMock, setupEmptyCache } from './cache-mock';
import { setupFetchMock, resetFetchMock } from './fetch-mock';

// Mock CacheStorage
jest.mock('../gh-cache-storage');
const MockCacheStorage = CacheStorage as jest.MockedClass<typeof CacheStorage>;

/**
 * Sets up common test environment for GitHubApiLoader tests
 */
export function setupTestEnvironment(): {
  loader: GitHubApiLoader;
  mockCache: jest.Mocked<CacheStorage>;
} {
  // Setup fetch mock
  setupFetchMock();
  
  // Create and setup cache mock
  const mockCache = createCacheMock();
  MockCacheStorage.mockImplementation(() => mockCache);
  setupEmptyCache(mockCache);
  
  // Create loader instance
  const loader = new GitHubApiLoader();
  
  return { loader, mockCache };
}

/**
 * Cleans up test environment
 */
export function cleanupTestEnvironment(): void {
  jest.clearAllMocks();
  resetFetchMock();
}

/**
 * Sets up a test with common beforeEach and afterEach patterns
 */
export function setupCommonTestHooks(): {
  getLoader: () => GitHubApiLoader;
  getMockCache: () => jest.Mocked<CacheStorage>;
} {
  let loader: GitHubApiLoader;
  let mockCache: jest.Mocked<CacheStorage>;

  beforeEach(() => {
    const setup = setupTestEnvironment();
    loader = setup.loader;
    mockCache = setup.mockCache;
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  return {
    getLoader: () => loader,
    getMockCache: () => mockCache,
  };
}
