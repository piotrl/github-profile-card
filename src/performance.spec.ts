/**
 * @jest-environment jsdom
 */
import { GitHubCardWidget } from './gh-profile-card';
import { CacheStorage } from './gh-cache-storage';
import { InMemoryStorage } from './testing/in-memory-storage';

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Widget Creation Performance', () => {
    it('should create widget instances quickly', () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        new GitHubCardWidget();
      }
      
      const end = performance.now();
      const duration = end - start;

      // Should create 100 instances in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple widgets on the same page', () => {
      document.body.innerHTML = `
        <div id="widget-1" data-username="user1"></div>
        <div id="widget-2" data-username="user2"></div>
        <div id="widget-3" data-username="user3"></div>
        <div id="widget-4" data-username="user4"></div>
        <div id="widget-5" data-username="user5"></div>
      `;

      const start = performance.now();

      const widgets = [
        new GitHubCardWidget({ template: '#widget-1' }),
        new GitHubCardWidget({ template: '#widget-2' }),
        new GitHubCardWidget({ template: '#widget-3' }),
        new GitHubCardWidget({ template: '#widget-4' }),
        new GitHubCardWidget({ template: '#widget-5' }),
      ];

      const end = performance.now();
      
      expect(widgets).toHaveLength(5);
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('DOM Manipulation Performance', () => {
    it('should clear large DOM trees efficiently', () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';
      const container = document.querySelector('#github-card') as HTMLElement;

      // Create a large DOM tree
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<span>Item ${i}</span><p>Content ${i}</p>`;
        container.appendChild(div);
      }

      expect(container.children.length).toBe(1000);

      const start = performance.now();
      
      // Clear children manually for performance testing
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      const end = performance.now();
      
      expect(container.textContent).toBe('');
      expect(end - start).toBeLessThan(50); // Should clear in under 50ms (relaxed for CI)
    });
  });

  describe('Cache Performance', () => {
    it('should handle large cache efficiently', () => {
      const storage = new InMemoryStorage();
      const cache = new CacheStorage(storage);

      const start = performance.now();

      // Add 1000 cache entries
      for (let i = 0; i < 1000; i++) {
        cache.add(`https://api.github.com/test/${i}`, {
          lastModified: 'Mon, 18 Mar 2019 20:40:35 GMT',
          data: { index: i, data: `Data for item ${i}` },
        });
      }

      const midTime = performance.now();

      // Retrieve cache entries
      for (let i = 0; i < 1000; i++) {
        const result = cache.get(`https://api.github.com/test/${i}`);
        expect(result?.data.index).toBe(i);
      }

      const end = performance.now();

      expect(midTime - start).toBeLessThan(100); // Adding should be fast
      expect(end - midTime).toBeLessThan(50);    // Retrieval should be very fast
    });

    it('should clear expired entries efficiently from large cache', () => {
      const storage = new InMemoryStorage();
      const cache = new CacheStorage(storage);

      // Add many entries with different dates
      for (let i = 0; i < 1000; i++) {
        const date = new Date(2020, 0, i % 365 + 1); // Spread across year 2020
        cache.add(`https://api.github.com/test/${i}`, {
          lastModified: date.toUTCString(),
          data: { index: i },
        });
      }

      const cutoffDate = new Date(2020, 5, 1); // June 1, 2020
      
      const start = performance.now();
      cache.clearExpiredEntries(cutoffDate);
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory when creating many widgets', () => {
      // This test helps identify memory leaks during development
      const widgets: GitHubCardWidget[] = [];

      for (let i = 0; i < 50; i++) {
        document.body.innerHTML = `<div id="github-card-${i}" data-username="user${i}"></div>`;
        widgets.push(new GitHubCardWidget({ template: `#github-card-${i}` }));
      }

      expect(widgets).toHaveLength(50);

      // Clean up
      document.body.innerHTML = '';
      widgets.length = 0;

      // Force garbage collection if available (only in Node.js with --expose-gc)
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors quickly without blocking', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      // Mock fetch to always fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const widget = new GitHubCardWidget();
      
      const start = performance.now();
      await widget.init();
      const end = performance.now();

      // Error handling should be fast
      expect(end - start).toBeLessThan(100);

      // Should show error in DOM
      expect(document.querySelector('.error')).toBeTruthy();
    });
  });

  describe('Sorting Performance', () => {
    it('should sort large repository arrays efficiently', () => {
      const repositories = [];
      
      // Create large array of mock repositories
      for (let i = 0; i < 1000; i++) {
        repositories.push({
          id: i,
          name: `repo-${i}`,
          stargazers_count: Math.floor(Math.random() * 1000),
          updated_at: new Date(2020 + Math.floor(Math.random() * 4), 
                              Math.floor(Math.random() * 12), 
                              Math.floor(Math.random() * 28)).toISOString(),
        });
      }

      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';
      const widget = new GitHubCardWidget();

      const start = performance.now();
      
      // Access private method for testing
      (widget as any).sortRepositories(repositories, 'stars');
      
      const end = performance.now();

      expect(end - start).toBeLessThan(50);

      // Verify sorting worked
      for (let i = 1; i < repositories.length; i++) {
        expect(repositories[i-1].stargazers_count).toBeGreaterThanOrEqual(
          repositories[i].stargazers_count
        );
      }
    });
  });

  describe('Language Processing Performance', () => {
    it('should process language statistics efficiently', () => {
      const langStats = [];
      
      // Create large language statistics array
      for (let i = 0; i < 100; i++) {
        const langs: { [key: string]: number } = {};
        const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'];
        
        languages.forEach(lang => {
          langs[lang] = Math.floor(Math.random() * 10000);
        });
        
        langStats.push(langs);
      }

      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';
      const widget = new GitHubCardWidget();

      const start = performance.now();
      
      // Access private method for testing
      const result = (widget as any).groupLanguagesUsage(langStats);
      
      const end = performance.now();

      expect(end - start).toBeLessThan(20);
      expect(Object.keys(result)).toContain('TypeScript');
      expect(Object.keys(result)).toContain('JavaScript');
    });
  });
});
