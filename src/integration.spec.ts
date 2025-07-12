/**
 * @jest-environment jsdom
 */
import { GitHubCardWidget } from './gh-profile-card';
import { ApiProfile, ApiRepository } from './interface/IGitHubApi';

// Mock fetch for integration tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Integration Tests', () => {
  const mockProfile: ApiProfile = {
    name: 'Test User',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    followers: 1234,
    followers_url: 'https://api.github.com/users/testuser/followers',
    html_url: 'https://github.com/testuser',
    login: 'testuser',
    repos_url: 'https://api.github.com/users/testuser/repos',
    id: 123456,
    gravatar_id: '',
    url: 'https://api.github.com/users/testuser',
    following_url: '',
    gists_url: '',
    starred_url: '',
    subscriptions_url: '',
    organizations_url: '',
    events_url: '',
    received_events_url: '',
    type: 'User',
    site_admin: false,
    company: '',
    blog: '',
    location: '',
    email: '',
    hireable: true,
    bio: '',
    public_repos: 10,
    public_gists: 5,
    following: 50,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockRepositories: ApiRepository[] = [
    {
      id: 1,
      name: 'awesome-project',
      full_name: 'testuser/awesome-project',
      html_url: 'https://github.com/testuser/awesome-project',
      description: 'An awesome project',
      languages_url: 'https://api.github.com/repos/testuser/awesome-project/languages',
      stargazers_count: 150,
      updated_at: '2023-02-01T00:00:00Z',
      owner: {} as any,
      private: false,
      fork: false,
      url: '',
      forks_url: '',
      keys_url: '',
      collaborators_url: '',
      teams_url: '',
      hooks_url: '',
      issue_events_url: '',
      events_url: '',
      assignees_url: '',
      branches_url: '',
      tags_url: '',
      blobs_url: '',
      git_tags_url: '',
      git_refs_url: '',
      trees_url: '',
      statuses_url: '',
      stargazers_url: '',
      contributors_url: '',
      subscribers_url: '',
      subscription_url: '',
      commits_url: '',
      git_commits_url: '',
      comments_url: '',
      issue_comment_url: '',
      contents_url: '',
      compare_url: '',
      merges_url: '',
      archive_url: '',
      downloads_url: '',
      issues_url: '',
      pulls_url: '',
      milestones_url: '',
      notifications_url: '',
      labels_url: '',
      releases_url: '',
      deployments_url: '',
      created_at: '2020-01-01T00:00:00Z',
      pushed_at: '2023-02-01T00:00:00Z',
      git_url: '',
      ssh_url: '',
      clone_url: '',
      svn_url: '',
      homepage: '',
      size: 100,
      watchers_count: 5,
      language: 'TypeScript',
      has_issues: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 2,
      open_issues_count: 1,
      forks: 2,
      open_issues: 1,
      watchers: 5,
      default_branch: 'main',
    },
    {
      id: 2,
      name: 'utility-lib',
      full_name: 'testuser/utility-lib',
      html_url: 'https://github.com/testuser/utility-lib',
      description: 'A utility library',
      languages_url: 'https://api.github.com/repos/testuser/utility-lib/languages',
      stargazers_count: 75,
      updated_at: '2023-01-15T00:00:00Z',
      owner: {} as any,
      private: false,
      fork: false,
      url: '',
      forks_url: '',
      keys_url: '',
      collaborators_url: '',
      teams_url: '',
      hooks_url: '',
      issue_events_url: '',
      events_url: '',
      assignees_url: '',
      branches_url: '',
      tags_url: '',
      blobs_url: '',
      git_tags_url: '',
      git_refs_url: '',
      trees_url: '',
      statuses_url: '',
      stargazers_url: '',
      contributors_url: '',
      subscribers_url: '',
      subscription_url: '',
      commits_url: '',
      git_commits_url: '',
      comments_url: '',
      issue_comment_url: '',
      contents_url: '',
      compare_url: '',
      merges_url: '',
      archive_url: '',
      downloads_url: '',
      issues_url: '',
      pulls_url: '',
      milestones_url: '',
      notifications_url: '',
      labels_url: '',
      releases_url: '',
      deployments_url: '',
      created_at: '2020-06-01T00:00:00Z',
      pushed_at: '2023-01-15T00:00:00Z',
      git_url: '',
      ssh_url: '',
      clone_url: '',
      svn_url: '',
      homepage: '',
      size: 50,
      watchers_count: 3,
      language: 'JavaScript',
      has_issues: true,
      has_downloads: true,
      has_wiki: false,
      has_pages: false,
      forks_count: 1,
      open_issues_count: 0,
      forks: 1,
      open_issues: 0,
      watchers: 3,
      default_branch: 'main',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  describe('Full Widget Lifecycle', () => {
    it('should render a complete widget with all components', async () => {
      // Setup DOM
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="testuser"
             data-max-repos="2"
             data-sort-by="stars"
             data-header-text="Top Repositories">
        </div>
      `;

      // Mock API responses
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
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue({ TypeScript: 5000, JavaScript: 3000 }),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue({ JavaScript: 4000, CSS: 1000 }),
        });

      // Create and initialize widget
      const widget = new GitHubCardWidget();
      widget.init();

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify DOM structure
      const widgetElement = document.querySelector('#github-card');
      expect(widgetElement?.classList.contains('gh-profile-card')).toBe(true);

      // Check profile section
      const profile = widgetElement?.querySelector('.profile');
      expect(profile).toBeTruthy();

      // Check avatar
      const avatar = profile?.querySelector('.avatar') as HTMLImageElement;
      expect(avatar?.src).toBe(mockProfile.avatar_url);
      expect(avatar?.alt).toBe('GitHub avatar');

      // Check name link
      const nameLink = profile?.querySelector('.name') as HTMLAnchorElement;
      expect(nameLink?.textContent).toBe(mockProfile.name);
      expect(nameLink?.href).toBe(mockProfile.html_url);

      // Check follow button
      const followButton = profile?.querySelector('.follow-button') as HTMLAnchorElement;
      expect(followButton?.textContent).toBe(`Follow @${mockProfile.login}`);
      expect(followButton?.href).toBe(mockProfile.html_url);

      // Check followers count
      const followers = profile?.querySelector('.followers');
      expect(followers?.textContent).toBe(String(mockProfile.followers));

      // Check repositories section
      const repos = widgetElement?.querySelector('.repos');
      expect(repos).toBeTruthy();

      // Check repositories header
      const reposHeader = repos?.querySelector('.header');
      expect(reposHeader?.textContent).toBe('Top Repositories');

      // Check repository items (should be limited to 2)
      const repoLinks = repos?.querySelectorAll('a');
      expect(repoLinks).toHaveLength(2);

      // Check first repository (should be sorted by stars)
      const firstRepo = repoLinks?.[0];
      expect(firstRepo?.querySelector('.repo-name')?.textContent?.trim()).toBe('awesome-project');
      expect(firstRepo?.querySelector('.star')?.textContent).toBe('150');

      // Check second repository
      const secondRepo = repoLinks?.[1];
      expect(secondRepo?.querySelector('.repo-name')?.textContent?.trim()).toBe('utility-lib');
      expect(secondRepo?.querySelector('.star')?.textContent).toBe('75');
    });

    it('should handle API errors gracefully', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="nonexistent"></div>';

      mockFetch.mockResolvedValueOnce({
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        json: jest.fn().mockResolvedValue({
          message: 'Not Found',
        }),
      });

      const widget = new GitHubCardWidget();
      await widget.init();

      const widgetElement = document.querySelector('#github-card');
      const errorElement = widgetElement?.querySelector('.error');
      
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Not found user: nonexistent');
    });

    it('should handle rate limiting with countdown', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      const resetDate = new Date(Date.now() + 3600000); // 1 hour from now
      mockFetch.mockResolvedValueOnce({
        status: 403,
        headers: {
          get: jest.fn((header) => {
            if (header === 'X-RateLimit-Remaining') return '0';
            if (header === 'X-RateLimit-Reset') return String(Math.floor(resetDate.getTime() / 1000));
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue({
          message: 'API rate limit exceeded (documentation URL)',
        }),
      });

      const widget = new GitHubCardWidget();
      await widget.init();

      const widgetElement = document.querySelector('#github-card');
      const errorElement = widgetElement?.querySelector('.error');
      const remainingTime = errorElement?.querySelector('.remain');
      
      expect(errorElement).toBeTruthy();
      expect(remainingTime?.textContent).toContain('Come back after');
      expect(remainingTime?.textContent).toContain('minutes');
    });

    it('should sort repositories by update time when specified', async () => {
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="testuser"
             data-sort-by="updateTime">
        </div>
      `;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      const repoLinks = document.querySelectorAll('.repos a');
      
      // When sorted by update time, the more recently updated repo should come first
      expect(repoLinks[0].querySelector('.repo-name')?.textContent?.trim()).toBe('awesome-project');
      expect(repoLinks[1].querySelector('.repo-name')?.textContent?.trim()).toBe('utility-lib');
    });

    it('should hide top languages when specified', async () => {
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="testuser"
             data-hide-top-languages="true">
        </div>
      `;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      const languagesSection = document.querySelector('.languages');
      expect(languagesSection).toBeFalsy();
    });

    it('should disable repositories section when maxRepos is 0', async () => {
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="testuser"
             data-max-repos="0">
        </div>
      `;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      const reposSection = document.querySelector('.repos');
      expect(reposSection).toBeFalsy();
    });
  });

  describe('Widget Refresh', () => {
    it('should update widget when refreshed with new options', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockProfile),
        })
        .mockResolvedValueOnce({
          status: 200,
          headers: { get: jest.fn().mockReturnValue(null) },
          json: jest.fn().mockResolvedValue(mockRepositories),
        });

      const widget = new GitHubCardWidget();
      await widget.init();

      // Verify initial state
      let reposHeader = document.querySelector('.repos .header');
      expect(reposHeader?.textContent).toBe('Most starred repositories');

      // Refresh with new options
      widget.refresh({
        headerText: 'Updated Header',
        maxRepos: 1,
        sortBy: 'updateTime',
      });

      // Verify updated state
      reposHeader = document.querySelector('.repos .header');
      expect(reposHeader?.textContent).toBe('Updated Header');

      const repoLinks = document.querySelectorAll('.repos a');
      expect(repoLinks).toHaveLength(1);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache API responses', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      // First request
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

      const widget1 = new GitHubCardWidget();
      await widget1.init();

      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify localStorage was called (caching)
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from network errors', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const widget = new GitHubCardWidget();
      await widget.init();

      const errorElement = document.querySelector('.error');
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

      mockFetch.mockResolvedValueOnce({
        status: 200,
        headers: { get: jest.fn().mockReturnValue(null) },
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      const widget = new GitHubCardWidget();
      await widget.init();

      const errorElement = document.querySelector('.error');
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Failed to parse API response as JSON');
    });
  });
});
