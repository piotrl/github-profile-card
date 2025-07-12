/**
 * @jest-environment jsdom
 */
import { GitHubCardWidget } from './gh-profile-card';
import { mockProfile, mockRepositories } from './testing/mock-github-data';

// Mock fetch for performance tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';
    localStorage.clear();

    // Mock successful API responses by default
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
  });

  describe('initialization performance', () => {
    it('should initialize widget within reasonable time', async () => {
      // Given
      const startTime = performance.now();
      const widget = new GitHubCardWidget();

      // When
      await widget.init();
      const endTime = performance.now();

      // Then
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should render DOM elements efficiently', async () => {
      // Given
      const widget = new GitHubCardWidget();
      const startTime = performance.now();

      // When
      await widget.init();
      const endTime = performance.now();

      // Then
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(500); // DOM rendering should be fast
    });

    it('should handle multiple widgets without performance degradation', async () => {
      // Given
      document.body.innerHTML = `
        <div id="github-card-1" data-username="user1"></div>
        <div id="github-card-2" data-username="user2"></div>
        <div id="github-card-3" data-username="user3"></div>
      `;

      // Mock responses for all three widgets
      for (let i = 0; i < 6; i++) { // 3 widgets * 2 API calls each
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(i % 2 === 0 ? mockProfile : mockRepositories),
        });
      }

      const startTime = performance.now();

      // When
      const widgets = [
        new GitHubCardWidget({ template: '#github-card-1' }),
        new GitHubCardWidget({ template: '#github-card-2' }),
        new GitHubCardWidget({ template: '#github-card-3' }),
      ];

      await Promise.all(widgets.map(widget => widget.init()));
      const endTime = performance.now();

      // Then
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(2000); // Multiple widgets should still be reasonably fast
    });
  });

  describe('memory usage', () => {
    it('should not create memory leaks during initialization', async () => {
      // Given
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const widget = new GitHubCardWidget();

      // When
      await widget.init();
      const afterInitMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Then
      const memoryIncrease = afterInitMemory - initialMemory;
      // Memory increase should be reasonable (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    it('should clean up properly on refresh', async () => {
      // Given
      const widget = new GitHubCardWidget();
      await widget.init();

      const beforeRefreshElements = document.querySelectorAll('#github-card *').length;

      // When
      widget.refresh({ maxRepos: 2 });
      const afterRefreshElements = document.querySelectorAll('#github-card *').length;

      // Then
      // Should not accumulate DOM elements on refresh
      expect(afterRefreshElements).toBeLessThanOrEqual(beforeRefreshElements + 5);
    });
  });

  describe('API call efficiency', () => {
    it('should minimize API calls through caching', async () => {
      // Given
      const widget1 = new GitHubCardWidget();
      await widget1.init();

      jest.clearAllMocks();

      // Setup second widget with same username
      document.body.innerHTML += '<div id="github-card-2" data-username="testuser"></div>';

      // When
      const widget2 = new GitHubCardWidget({ template: '#github-card-2' });
      await widget2.init();

      // Then
      const apiCallCount = mockFetch.mock.calls.length;
      expect(apiCallCount).toBe(0); // Should use cached data, no new API calls
    });

    it('should handle concurrent API requests efficiently', async () => {
      // Given
      document.body.innerHTML = `
        <div id="github-card-1" data-username="user1"></div>
        <div id="github-card-2" data-username="user2"></div>
      `;

      // Mock responses for concurrent requests
      for (let i = 0; i < 4; i++) { // 2 widgets * 2 API calls each
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(i % 2 === 0 ? mockProfile : mockRepositories),
        });
      }

      const startTime = performance.now();

      // When
      const widgets = [
        new GitHubCardWidget({ template: '#github-card-1' }),
        new GitHubCardWidget({ template: '#github-card-2' }),
      ];

      await Promise.all(widgets.map(widget => widget.init()));
      const endTime = performance.now();

      // Then
      const concurrentTime = endTime - startTime;
      expect(concurrentTime).toBeLessThan(1500); // Concurrent requests should be efficient
    });
  });

  describe('DOM manipulation performance', () => {
    it('should efficiently clear and rebuild DOM content', () => {
      // Given
      const widget = new GitHubCardWidget();
      const cardElement = document.querySelector('#github-card')!;

      // Add some initial content
      cardElement.innerHTML = '<div>Initial content</div>'.repeat(100);
      const startTime = performance.now();

      // When
      widget.refresh({ maxRepos: 5 });
      const endTime = performance.now();

      // Then
      const clearTime = endTime - startTime;
      expect(clearTime).toBeLessThan(100); // DOM clearing should be very fast
    });

    it('should handle large repository lists efficiently', async () => {
      // Given
      const largeRepoList = Array(50).fill(0).map((_, index) => ({
        ...mockRepositories[0],
        id: index,
        name: `repo-${index}`,
      }));

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: () => null },
          json: () => Promise.resolve(largeRepoList),
        });

      const widget = new GitHubCardWidget({ maxRepos: 50 });
      const startTime = performance.now();

      // When
      await widget.init();
      const endTime = performance.now();

      // Then
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(2000); // Should handle large lists efficiently
    });

    it('should efficiently update display when configuration changes', () => {
      // Given
      const widget = new GitHubCardWidget();
      const startTime = performance.now();

      // When
      widget.refresh({ sortBy: 'stars' });
      widget.refresh({ sortBy: 'updateTime' });
      widget.refresh({ maxRepos: 3 });
      const endTime = performance.now();

      // Then
      const updateTime = endTime - startTime;
      expect(updateTime).toBeLessThan(50); // Multiple updates should be fast
    });
  });

  describe('cache performance', () => {
    it('should store and retrieve cached data efficiently', async () => {
      // Given
      const widget = new GitHubCardWidget();
      await widget.init(); // This should cache the data

      jest.clearAllMocks();
      const startTime = performance.now();

      // When
      const newWidget = new GitHubCardWidget();
      await newWidget.init(); // This should use cached data
      const endTime = performance.now();

      // Then
      const cacheRetrievalTime = endTime - startTime;
      expect(cacheRetrievalTime).toBeLessThan(100); // Cache retrieval should be very fast
    });

    it('should handle cache storage without performance impact', async () => {
      // Given
      const widget = new GitHubCardWidget();
      const startTime = performance.now();

      // When
      await widget.init(); // This includes caching
      const endTime = performance.now();

      // Then
      const totalTimeWithCaching = endTime - startTime;
      expect(totalTimeWithCaching).toBeLessThan(1000); // Caching shouldn't significantly slow down init
    });
  });

  describe('error handling performance', () => {
    it('should handle API errors without performance degradation', async () => {
      // Given
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const widget = new GitHubCardWidget();
      const startTime = performance.now();

      // When
      await widget.init();
      const endTime = performance.now();

      // Then
      const errorHandlingTime = endTime - startTime;
      expect(errorHandlingTime).toBeLessThan(500); // Error handling should be fast
    });

    it('should efficiently display error messages', async () => {
      // Given
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      const widget = new GitHubCardWidget();
      const startTime = performance.now();

      // When
      await widget.init();
      const endTime = performance.now();

      // Then
      const errorDisplayTime = endTime - startTime;
      expect(errorDisplayTime).toBeLessThan(200); // Error display should be immediate
    });
  });
});
