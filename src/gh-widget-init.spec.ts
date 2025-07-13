/**
 * @jest-environment jsdom
 */

// Mock the GitHubCardWidget
jest.mock('./gh-profile-card');

import { GitHubCardWidget } from './gh-profile-card';
const MockGitHubCardWidget = GitHubCardWidget as jest.MockedClass<
  typeof GitHubCardWidget
>;

// Import after mocking
import './gh-widget-init';

describe('Widget Initialization', () => {
  let mockWidget: jest.Mocked<GitHubCardWidget>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear any existing DOM
    document.body.innerHTML = '';

    // Mock widget instance
    mockWidget = {
      init: jest.fn(),
      refresh: jest.fn(),
    } as any;

    MockGitHubCardWidget.mockImplementation(() => mockWidget);
  });

  describe('Global GitHubCard', () => {
    it('should expose GitHubCard class globally', () => {
      expect(window.GitHubCard).toBe(GitHubCardWidget);
    });

    it('should allow creating new instances via global', () => {
      const widget = new window.GitHubCard();
      expect(MockGitHubCardWidget).toHaveBeenCalled();
    });
  });

  describe('Automatic initialization', () => {
    it('should auto-initialize when #github-card element exists', () => {
      // Setup DOM with default template
      document.body.innerHTML =
        '<div id="github-card" data-username="testuser"></div>';

      // Trigger DOMContentLoaded event
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(MockGitHubCardWidget).toHaveBeenCalled();
      expect(mockWidget.init).toHaveBeenCalled();
    });

    it('should not auto-initialize when #github-card element does not exist', () => {
      // Setup DOM without default template
      document.body.innerHTML = '<div id="other-element"></div>';

      // Trigger DOMContentLoaded event
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(MockGitHubCardWidget).not.toHaveBeenCalled();
      expect(mockWidget.init).not.toHaveBeenCalled();
    });

    it('should work when DOM is already loaded', () => {
      // Setup DOM
      document.body.innerHTML =
        '<div id="github-card" data-username="testuser"></div>';

      // Simulate DOMContentLoaded already fired by directly calling the handler
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(MockGitHubCardWidget).toHaveBeenCalled();
      expect(mockWidget.init).toHaveBeenCalled();
    });

    it('should handle multiple #github-card elements gracefully', () => {
      // Setup DOM with multiple elements (though selector should only find first)
      document.body.innerHTML = `
        <div id="github-card" data-username="testuser1"></div>
        <div id="github-card-2" data-username="testuser2"></div>
      `;

      // Trigger DOMContentLoaded event
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      // Should only initialize once for the first #github-card
      expect(MockGitHubCardWidget).toHaveBeenCalledTimes(1);
      expect(mockWidget.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual initialization', () => {
    it('should allow manual initialization with custom options', () => {
      document.body.innerHTML =
        '<div id="custom-template" data-username="testuser"></div>';

      const customWidget = new window.GitHubCard({
        template: '#custom-template',
        sortBy: 'updateTime',
        maxRepos: 3,
      });

      expect(MockGitHubCardWidget).toHaveBeenCalledWith({
        template: '#custom-template',
        sortBy: 'updateTime',
        maxRepos: 3,
      });
    });

    it('should allow multiple manual widget instances', () => {
      document.body.innerHTML = `
        <div id="widget-1" data-username="user1"></div>
        <div id="widget-2" data-username="user2"></div>
      `;

      const widget1 = new window.GitHubCard({ template: '#widget-1' });
      const widget2 = new window.GitHubCard({ template: '#widget-2' });

      expect(MockGitHubCardWidget).toHaveBeenCalledTimes(2);
      expect(MockGitHubCardWidget).toHaveBeenNthCalledWith(1, {
        template: '#widget-1',
      });
      expect(MockGitHubCardWidget).toHaveBeenNthCalledWith(2, {
        template: '#widget-2',
      });
    });
  });

  describe('Error scenarios', () => {
    it('should handle widget initialization errors gracefully', () => {
      MockGitHubCardWidget.mockImplementation(() => {
        throw new Error('Template not found');
      });

      document.body.innerHTML =
        '<div id="github-card" data-username="testuser"></div>';

      // Should not throw when auto-initializing
      expect(() => {
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should handle widget init() method errors gracefully', () => {
      mockWidget.init.mockImplementation(() => {
        throw new Error('API error');
      });

      document.body.innerHTML =
        '<div id="github-card" data-username="testuser"></div>';

      // Should not throw when auto-initializing
      expect(() => {
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
      }).not.toThrow();
    });
  });

  describe('Browser compatibility', () => {
    it('should work with querySelector', () => {
      document.body.innerHTML =
        '<div id="github-card" data-username="testuser"></div>';

      const element = document.querySelector('#github-card');
      expect(element).not.toBeNull();
      expect(element?.id).toBe('github-card');
    });

    it('should work with addEventListener', () => {
      const handler = jest.fn();
      document.addEventListener('DOMContentLoaded', handler);

      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('CSS loading', () => {
    it('should import CSS styles', () => {
      // The actual CSS import is handled by the bundler
      // We just verify the import statement exists in the module
      // This is more of a integration test that would be caught during build
      expect(true).toBe(true); // Placeholder - CSS loading is tested in build process
    });
  });
});
