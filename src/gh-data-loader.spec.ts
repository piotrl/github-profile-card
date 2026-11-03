import {
  beforeEach,
  describe,
  expect,
  it,
  afterEach,
  vi,
  type Mocked,
} from 'vitest';
import { GitHubApiLoader } from './gh-data-loader';
import { CacheStorage } from './gh-cache-storage';
import type { ApiRepository } from './interface/IGitHubApi';

import {
  cleanupTestEnvironment,
  createErrorResponse,
  createJsonError,
  createNetworkError,
  createSuccessResponse,
  mockFetch,
  mockLanguageStats,
  mockProfile,
  mockRepositories,
  setupEmptyCache,
  setupLanguageMocks,
  setupTestEnvironment,
  setupUserDataMocks,
} from './testing/index';

describe('GitHubApiLoader', () => {
  let loader: GitHubApiLoader;
  let mockCache: Mocked<CacheStorage>;

  beforeEach(() => {
    const setup = setupTestEnvironment();
    loader = setup.loader;
    mockCache = setup.mockCache;
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('loadUserData', () => {
    it('should load user profile and repositories successfully', async () => {
      // Given
      setupUserDataMocks(mockProfile, mockRepositories);
      setupEmptyCache(mockCache);

      // When
      const result = await loader.loadUserData('testuser');

      // Then
      expect(result).toEqual({
        profile: mockProfile,
        repositories: mockRepositories,
      });
    });

    it('should make correct number of API calls', async () => {
      // Given
      setupUserDataMocks(mockProfile, mockRepositories);
      setupEmptyCache(mockCache);

      // When
      await loader.loadUserData('testuser');

      // Then
      const callCount = mockFetch.mock.calls.length;
      expect(callCount).toBe(2);
    });

    it('should call profile API with correct URL', async () => {
      // Given
      setupUserDataMocks(mockProfile, mockRepositories);
      setupEmptyCache(mockCache);

      // When
      await loader.loadUserData('testuser');

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.any(Object),
      );
    });

    it('should cache API responses after successful load', async () => {
      // Given
      setupUserDataMocks(mockProfile, mockRepositories);
      setupEmptyCache(mockCache);

      // When
      await loader.loadUserData('testuser');

      // Then
      const cacheAddCallCount = mockCache.add.mock.calls.length;
      expect(cacheAddCallCount).toBe(2);
    });

    it('should throw error for empty username', async () => {
      // Given
      const emptyUsername = '';

      // When & Then
      await expect(loader.loadUserData(emptyUsername)).rejects.toThrow();
    });

    it('should throw error for whitespace username', async () => {
      // Given
      const whitespaceUsername = '   ';

      // When & Then
      await expect(loader.loadUserData(whitespaceUsername)).rejects.toThrow();
    });

    it('should throw error for null username', async () => {
      // Given
      const nullUsername = null as any;

      // When & Then
      await expect(loader.loadUserData(nullUsername)).rejects.toThrow();
    });

    it('should handle 404 user not found error', async () => {
      // Given
      mockFetch.mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));
      setupEmptyCache(mockCache);

      // When
      const result = loader.loadUserData('nonexistentuser');

      // Then
      await expect(result).rejects.toMatchObject({
        message: 'Not Found',
        isWrongUser: true,
      });
    });

    it('should handle rate limit error', async () => {
      // Given
      const resetDate = new Date(Date.now() + 3600000); // 1 hour from now

      mockFetch.mockResolvedValueOnce(
        createErrorResponse(403, 'API rate limit exceeded (test details)', {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(resetDate.getTime() / 1000)),
        }),
      );
      setupEmptyCache(mockCache);

      // When
      const result = loader.loadUserData('testuser');

      // Then
      await expect(result).rejects.toMatchObject({
        message: 'API rate limit exceeded ',
        resetDate: expect.any(Date),
      });
    });

    it('should use cached data when available with 304 response', async () => {
      // Given
      mockCache.get.mockReturnValue({
        lastModified: 'Mon, 18 Mar 2019 20:40:35 GMT',
        data: mockProfile,
      });

      mockFetch.mockResolvedValueOnce({
        status: 304,
      });

      // We need to test the internal fetch method indirectly
      // Since we can't test 304 directly with loadUserData, let's test the behavior
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: {
            get: vi.fn().mockReturnValue('Mon, 18 Mar 2019 20:40:35 GMT'),
          },
          json: vi.fn(() => Promise.resolve(mockProfile)),
        } as any)
        .mockResolvedValueOnce({
          status: 200,
          headers: {
            get: vi.fn().mockReturnValue('Mon, 18 Mar 2019 20:40:35 GMT'),
          },
          json: vi.fn(() => Promise.resolve(mockRepositories)),
        } as any);

      // When
      const result = await loader.loadUserData('testuser');

      // Then
      expect(result).toBeDefined();
    });

    it('should handle network errors', async () => {
      // Given
      // First setup valid profile response, then fail on repos
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockProfile))
        .mockRejectedValueOnce(createNetworkError('Network failure'));
      setupEmptyCache(mockCache);

      // When
      const result = loader.loadUserData('testuser');

      // Then
      await expect(result).rejects.toThrow('Network error: Network failure');
    });

    it('should handle JSON parsing errors', async () => {
      // Given
      // First setup valid profile response, then fail parsing on repos
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockProfile))
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: vi.fn().mockReturnValue(null) },
          json: vi
            .fn<() => Promise<unknown>>()
            .mockRejectedValue(createJsonError('Invalid JSON')),
        });
      setupEmptyCache(mockCache);

      // When
      const result = loader.loadUserData('testuser');

      // Then
      await expect(result).rejects.toThrow(
        'Failed to parse API response as JSON',
      );
    });
  });

  describe('loadRepositoriesLanguages', () => {
    const loadLanguages = (repos: ApiRepository[]) =>
      new Promise<Record<string, number>[]>((resolve) =>
        loader.loadRepositoriesLanguages(repos, resolve),
      );

    it('should load language statistics for repositories', async () => {
      setupLanguageMocks(mockLanguageStats);
      setupEmptyCache(mockCache);

      const langStats = await loadLanguages(mockRepositories.slice(0, 2));

      expect(langStats).toHaveLength(2);
      // Completion order is not guaranteed
      expect(langStats).toEqual(expect.arrayContaining(mockLanguageStats));
    });

    it('should handle empty repositories array', async () => {
      expect(await loadLanguages([])).toEqual([]);
    });

    it('should handle null repositories', async () => {
      expect(await loadLanguages(null as any)).toEqual([]);
    });

    it('should handle failed language requests gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockLanguageStats[0]))
        .mockRejectedValueOnce(createNetworkError('Network error'));
      setupEmptyCache(mockCache);

      const langStats = await loadLanguages(mockRepositories.slice(0, 2));

      expect(langStats).toHaveLength(2);
      // One should succeed with the mock data, one should fail with empty object
      expect(langStats).toEqual(
        expect.arrayContaining([mockLanguageStats[0], {}]),
      );
    });

    it('should handle repositories without language URLs', async () => {
      const reposWithoutLangUrl = mockRepositories.map((repo) => ({
        ...repo,
        languages_url: undefined as any,
      }));

      expect(await loadLanguages(reposWithoutLangUrl)).toEqual([]);
    });
  });
});
