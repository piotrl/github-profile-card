/**
 * @jest-environment jsdom
 */
import { GitHubCardWidget } from './gh-profile-card';
import { mockProfile, mockRepositories } from './testing/mock-github-data';

// Mock fetch for integration tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

    // Clear localStorage
    localStorage.clear();
  });

  describe('widget initialization and data flow', () => {
    it('should initialize widget with DOM element', () => {
      // Given - setup in beforeEach

      // When
      const widget = new GitHubCardWidget();

      // Then
      expect(widget).toBeDefined();
    });

    it('should successfully load and display user data', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasContent = cardElement?.innerHTML.length > 0;
      expect(hasContent).toBe(true);
    });

    it('should display profile information in DOM', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const containsUsername = cardElement?.textContent?.includes(mockProfile.login) ?? false;
      expect(containsUsername).toBe(true);
    });

    it('should display repository information in DOM', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const containsRepoName = cardElement?.textContent?.includes(mockRepositories[0].name) ?? false;
      expect(containsRepoName).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasErrorContent = cardElement?.textContent?.includes('error') ?? false;
      expect(hasErrorContent).toBe(true);
    });

    it('should cache successful API responses', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cacheKeys = Object.keys(localStorage);
      const hasCacheData = cacheKeys.length > 0;
      expect(hasCacheData).toBe(true);
    });
  });

  describe('configuration handling', () => {
    it('should respect maxRepos configuration', async () => {
      // Given
      document.body.innerHTML = '<div id="github-card" data-username="testuser" data-max-repos="1"></div>';

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const repoElements = document.querySelectorAll('.repository');
      const repoCount = repoElements.length;
      expect(repoCount).toBeLessThanOrEqual(1);
    });

    it('should handle sort-by configuration', async () => {
      // Given
      document.body.innerHTML = '<div id="github-card" data-username="testuser" data-sort-by="stars"></div>';

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasContent = cardElement?.innerHTML.length > 0;
      expect(hasContent).toBe(true);
    });

    it('should handle hide-top-languages configuration', async () => {
      // Given
      document.body.innerHTML = '<div id="github-card" data-username="testuser" data-hide-top-languages="true"></div>';

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const languagesSection = document.querySelector('.languages');
      expect(languagesSection).toBeNull();
    });
  });

  describe('error scenarios', () => {
    it('should display user not found error', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        status: 404,
        statusText: 'Not Found',
        headers: { get: () => null },
        json: () => Promise.reject(new Error('Not Found')),
      });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const containsNotFound = cardElement?.textContent?.includes('not found') ?? false;
      expect(containsNotFound).toBe(true);
    });

    it('should display network error message', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasErrorMessage = cardElement?.textContent?.includes('error') ?? false;
      expect(hasErrorMessage).toBe(true);
    });

    it('should handle rate limit errors', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        status: 403,
        statusText: 'Forbidden',
        headers: {
          get: (name: string) => {
            if (name === 'X-RateLimit-Remaining') return '0';
            if (name === 'X-RateLimit-Reset') return String(Math.floor(Date.now() / 1000) + 3600);
            return null;
          }
        },
        json: () => Promise.reject(new Error('Rate limit exceeded')),
      });

      const widget = new GitHubCardWidget();

      // When
      await widget.init();

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasRateLimitMessage = cardElement?.textContent?.includes('limit') ?? false;
      expect(hasRateLimitMessage).toBe(true);
    });
  });

  describe('refresh functionality', () => {
    it('should refresh widget with new configuration', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      // When
      widget.refresh({ maxRepos: 1 });

      // Then
      const cardElement = document.querySelector('#github-card');
      const hasContent = cardElement?.innerHTML.length > 0;
      expect(hasContent).toBe(true);
    });

    it('should maintain data after refresh', async () => {
      // Given
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      // When
      widget.refresh({ sortBy: 'updateTime' });

      // Then
      const cardElement = document.querySelector('#github-card');
      const containsUsername = cardElement?.textContent?.includes(mockProfile.login) ?? false;
      expect(containsUsername).toBe(true);
    });
  });
});
