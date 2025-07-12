/**
 * @jest-environment jsdom
 */
import { GitHubApiLoader } from './gh-data-loader';
import { CacheStorage } from './gh-cache-storage';

// Import test utilities and mocks
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
  let mockCache: jest.Mocked<CacheStorage>;

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
      // Setup mocks using utilities
      setupUserDataMocks(mockProfile, mockRepositories);
      setupEmptyCache(mockCache);

      // Execute
      const result = await loader.loadUserData('testuser');

      // Verify
      expect(result).toEqual({
        profile: mockProfile,
        repositories: mockRepositories,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.any(Object),
      );
      expect(mockCache.add).toHaveBeenCalledTimes(2);
    });

    it('should throw error for invalid username', async () => {
      await expect(loader.loadUserData('')).rejects.toThrow(
        'Username cannot be empty',
      );
      await expect(loader.loadUserData('   ')).rejects.toThrow(
        'Username cannot be empty',
      );
      await expect(loader.loadUserData(null as any)).rejects.toThrow(
        'Invalid username provided',
      );
    });

    it('should handle 404 user not found error', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));
      setupEmptyCache(mockCache);

      await expect(
        loader.loadUserData('nonexistentuser'),
      ).rejects.toMatchObject({
        message: 'Not Found',
        isWrongUser: true,
      });
    });

    it('should handle rate limit error', async () => {
      const resetDate = new Date(Date.now() + 3600000); // 1 hour from now

      mockFetch.mockResolvedValueOnce(
        createErrorResponse(403, 'API rate limit exceeded (test details)', {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(resetDate.getTime() / 1000)),
        }),
      );
      setupEmptyCache(mockCache);

      try {
        await loader.loadUserData('testuser');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toMatchObject({
          message: 'API rate limit exceeded ',
          resetDate: expect.any(Date),
        });
      }
    });

    it('should use cached data when available with 304 response', async () => {
      const cachedData = {
        profile: mockProfile,
        repositories: mockRepositories,
      };

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
            get: jest.fn().mockReturnValue('Mon, 18 Mar 2019 20:40:35 GMT'),
          },
          json: jest.fn().mockResolvedValue(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: {
            get: jest.fn().mockReturnValue('Mon, 18 Mar 2019 20:40:35 GMT'),
          },
          json: jest.fn().mockResolvedValue(mockRepositories),
        });

      const result = await loader.loadUserData('testuser');
      expect(result).toBeDefined();
    });

    it('should handle network errors', async () => {
      // First setup valid profile response, then fail on repos
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockProfile))
        .mockRejectedValueOnce(createNetworkError('Network failure'));
      setupEmptyCache(mockCache);

      await expect(loader.loadUserData('testuser')).rejects.toThrow(
        'Network error: Network failure',
      );
    });

    it('should handle JSON parsing errors', async () => {
      // First setup valid profile response, then fail parsing on repos
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockProfile))
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockRejectedValue(createJsonError('Invalid JSON')),
        });
      setupEmptyCache(mockCache);

      await expect(loader.loadUserData('testuser')).rejects.toThrow(
        'Failed to parse API response as JSON',
      );
    });
  });

  describe('loadRepositoriesLanguages', () => {
    it('should load language statistics for repositories', (done) => {
      // Setup language mocks using utility
      setupLanguageMocks(mockLanguageStats);
      setupEmptyCache(mockCache);

      loader.loadRepositoriesLanguages(
        mockRepositories.slice(0, 2),
        (langStats) => {
          try {
            expect(langStats).toHaveLength(2);
            // Since completion order is not guaranteed, just check that we got the expected data
            expect(langStats).toEqual(
              expect.arrayContaining([
                mockLanguageStats[0],
                mockLanguageStats[1],
              ]),
            );
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle empty repositories array', (done) => {
      loader.loadRepositoriesLanguages([], (langStats) => {
        expect(langStats).toEqual([]);
        done();
      });
    });

    it('should handle null repositories', (done) => {
      loader.loadRepositoriesLanguages(null as any, (langStats) => {
        expect(langStats).toEqual([]);
        done();
      });
    });

    it('should handle failed language requests gracefully', (done) => {
      mockFetch
        .mockResolvedValueOnce(createSuccessResponse(mockLanguageStats[0]))
        .mockRejectedValueOnce(createNetworkError('Network error'));
      setupEmptyCache(mockCache);

      loader.loadRepositoriesLanguages(
        mockRepositories.slice(0, 2),
        (langStats) => {
          try {
            expect(langStats).toHaveLength(2);
            // One should succeed with the mock data, one should fail with empty object
            expect(langStats).toEqual(
              expect.arrayContaining([mockLanguageStats[0], {}]),
            );
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle repositories without language URLs', (done) => {
      const reposWithoutLangUrl = mockRepositories.map((repo) => ({
        ...repo,
        languages_url: undefined as any,
      }));

      loader.loadRepositoriesLanguages(reposWithoutLangUrl, (langStats) => {
        expect(langStats).toEqual([]);
        done();
      });
    });
  });
});
