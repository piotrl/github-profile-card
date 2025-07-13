import { beforeEach, describe, expect, it } from '@jest/globals';
import { DOMOperator } from './gh-dom-operator';
import { ApiError, ApiProfile, ApiRepository } from './interface/IGitHubApi';

describe('DOMOperator', () => {
  const initTemplate = `
        <div id="github-card" data-username="piotrl"></div>
    `;

  let $template: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = initTemplate;
    $template = document.querySelector<HTMLElement>('#github-card')!;
  });

  describe('basic functionality', () => {
    it('should compile', () => {
      expect($template).toBeDefined();
    });

    it('should clear children efficiently', () => {
      $template.innerHTML = `
              <div class="profile"></div>
              <div class="repos"></div>
          `;

      DOMOperator.clearChildren($template);
      const result = $template.innerHTML;

      expect(result).toBe('');
    });

    it('should clear children with text content', () => {
      $template.textContent = 'Some text content';
      $template.appendChild(document.createElement('div'));

      DOMOperator.clearChildren($template);

      expect($template.textContent).toBe('');
      expect($template.children).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should create API error', () => {
      const error: ApiError = {
        message: 'Service not reachable',
      };

      const $error = DOMOperator.createError(error, '');
      const message = $error.textContent;

      expect(message).toBe('Service not reachable');
      expect($error.className).toBe('error');
    });

    it('should create 404 error', () => {
      const username = 'piotrl-not-defined';
      const error: ApiError = {
        isWrongUser: true,
        message: 'Username not found',
      };

      const $error = DOMOperator.createError(error, username);
      const message = $error.textContent;

      expect(message).toBe(`Not found user: ${username}`);
    });

    it('should create rate limit error with remaining time', () => {
      const username = 'testuser';
      const resetDate = new Date(Date.now() + 3600000); // 1 hour from now
      const error: ApiError = {
        message: 'Rate limit exceeded',
        resetDate,
      };

      const $error = DOMOperator.createError(error, username);

      expect($error.children).toHaveLength(2);
      expect($error.children[0].textContent).toBe('Rate limit exceeded');
      expect($error.children[1].textContent).toContain('Come back after');
      expect($error.children[1].className).toBe('remain');
    });

    it('should handle past reset date', () => {
      const username = 'testuser';
      const resetDate = new Date(Date.now() - 3600000); // 1 hour ago
      const error: ApiError = {
        message: 'Rate limit exceeded',
        resetDate,
      };

      const $error = DOMOperator.createError(error, username);

      // Should still show the remaining time (will be negative, but handled)
      expect($error.children).toHaveLength(2);
      expect($error.children[1].textContent).toContain('Come back after');
    });

    it('should handle empty error message', () => {
      const error: ApiError = {
        message: '',
      };

      const $error = DOMOperator.createError(error, 'testuser');

      expect($error.children[0].textContent).toBe('');
    });
  });

  describe('profile creation', () => {
    const mockProfile: ApiProfile = {
      name: 'Test User',
      avatar_url: 'https://avatars.githubusercontent.com/u/123456',
      followers: 1234,
      html_url: 'https://github.com/testuser',
      login: 'testuser',
      // Required fields
      followers_url: '',
      repos_url: '',
      id: 123456,
      gravatar_id: '',
      url: '',
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

    it('should create profile element', () => {
      const $profile = DOMOperator.createProfile(mockProfile);

      expect($profile.tagName).toBe('DIV');
      expect($profile.classList.contains('profile')).toBe(true);
    });

    it('should handle profile with missing name', () => {
      const profileWithoutName = { ...mockProfile, name: null as any };

      const $profile = DOMOperator.createProfile(profileWithoutName);

      expect($profile).toBeDefined();
    });

    it('should handle profile with empty avatar URL', () => {
      const profileWithoutAvatar = { ...mockProfile, avatar_url: '' };

      const $profile = DOMOperator.createProfile(profileWithoutAvatar);

      expect($profile).toBeDefined();
    });
  });

  describe('top languages', () => {
    it('should create top languages section', () => {
      const $langsList = DOMOperator.createTopLanguagesSection();

      expect($langsList.tagName).toBe('UL');
      expect($langsList.className).toBe('languages');
    });

    it('should create top languages list with multiple languages', () => {
      const langs = {
        TypeScript: 10000,
        JavaScript: 5000,
        CSS: 2000,
        HTML: 1000,
        Python: 500,
      };

      const result = DOMOperator.createTopLanguagesList(langs);

      expect(result).toContain('<li>TypeScript</li>');
      expect(result).toContain('<li>JavaScript</li>');
      expect(result).toContain('<li>CSS</li>');
      // Should only include top 3
      expect(result).not.toContain('<li>HTML</li>');
      expect(result).not.toContain('<li>Python</li>');
    });

    it('should create top languages list with fewer than 3 languages', () => {
      const langs = {
        TypeScript: 10000,
        JavaScript: 5000,
      };

      const result = DOMOperator.createTopLanguagesList(langs);

      expect(result).toContain('<li>TypeScript</li>');
      expect(result).toContain('<li>JavaScript</li>');
      expect((result.match(/<li>/g) || []).length).toBe(2);
    });

    it('should handle empty languages object', () => {
      const langs = {};

      const result = DOMOperator.createTopLanguagesList(langs);

      expect(result).toBe('');
    });

    it('should escape HTML in language names', () => {
      const langs = {
        'C++': 10000,
        '<script>alert("xss")</script>': 5000,
        'C#': 2000,
      };

      const result = DOMOperator.createTopLanguagesList(langs);

      expect(result).toContain('<li>C++</li>');
      expect(result).toContain('<li>C#</li>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should sort languages by usage correctly', () => {
      const langs = {
        JavaScript: 5000,
        TypeScript: 10000,
        CSS: 2000,
      };

      const result = DOMOperator.createTopLanguagesList(langs);
      const firstLang = result.match(/<li>([^<]+)</)?.[1];

      expect(firstLang).toBe('TypeScript');
    });
  });

  describe('repositories', () => {
    const mockRepo: ApiRepository = {
      id: 1,
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      html_url: 'https://github.com/testuser/test-repo',
      description: 'A test repository',
      stargazers_count: 42,
      updated_at: '2023-01-01T00:00:00Z',
      // Required minimal fields
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
      languages_url: '',
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
      pushed_at: '2023-01-01T00:00:00Z',
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
    };

    it('should create repositories header', () => {
      const headerText = 'Most starred repositories';
      const $header = DOMOperator.createRepositoriesHeader(headerText);

      expect($header.tagName).toBe('SPAN');
      expect($header.className).toBe('header');
      expect($header.textContent).toBe(headerText);
    });

    it('should create repositories list', () => {
      const repos = [mockRepo];
      const $reposList = DOMOperator.createRepositoriesList(repos, 5);

      expect($reposList.tagName).toBe('DIV');
      expect($reposList.className).toBe('repos');
      expect($reposList.children).toHaveLength(1);
    });

    it('should limit repositories to maxRepos', () => {
      const repos = [mockRepo, { ...mockRepo, id: 2 }, { ...mockRepo, id: 3 }];
      const $reposList = DOMOperator.createRepositoriesList(repos, 2);

      expect($reposList.children).toHaveLength(2);
    });

    it('should create repository element with safe DOM manipulation', () => {
      const $reposList = DOMOperator.createRepositoriesList([mockRepo], 1);
      const $repoElement = $reposList.children[0] as HTMLAnchorElement;

      expect($repoElement.tagName).toBe('A');
      expect($repoElement.href).toBe(mockRepo.html_url);
      expect($repoElement.title).toBe(mockRepo.description);

      // Check child elements
      const $repoName = $repoElement.querySelector('.repo-name');
      const $updated = $repoElement.querySelector('.updated');
      const $star = $repoElement.querySelector('.star');

      expect($repoName?.textContent).toBe(mockRepo.name);
      expect($updated?.textContent).toContain('Updated:');
      expect($star?.textContent).toBe(String(mockRepo.stargazers_count));
    });

    it('should handle repository without description', () => {
      const repoWithoutDesc = { ...mockRepo, description: null };
      const $reposList = DOMOperator.createRepositoriesList(
        [repoWithoutDesc],
        1,
      );
      const $repoElement = $reposList.children[0] as HTMLAnchorElement;

      expect($repoElement.title).toBe('');
    });

    it('should handle repository with malicious content', () => {
      const maliciousRepo = {
        ...mockRepo,
        name: '<script>alert("xss")</script>',
        description: '<img src=x onerror=alert("xss")>',
      };

      const $reposList = DOMOperator.createRepositoriesList([maliciousRepo], 1);
      const $repoElement = $reposList.children[0] as HTMLAnchorElement;
      const $repoName = $repoElement.querySelector('.repo-name');

      expect($repoName?.textContent).toBe('<script>alert("xss")</script>');
      expect($repoName?.innerHTML).not.toContain('<script>');
      expect($repoElement.title).toBe('<img src=x onerror=alert("xss")>');
    });

    it('should handle invalid date in repository', () => {
      const repoWithInvalidDate = { ...mockRepo, updated_at: 'invalid-date' };
      const $reposList = DOMOperator.createRepositoriesList(
        [repoWithInvalidDate],
        1,
      );
      const $repoElement = $reposList.children[0] as HTMLAnchorElement;
      const $updated = $repoElement.querySelector('.updated');

      expect($updated?.textContent).toContain('Updated:');
      expect($updated?.textContent).toContain('Invalid Date');
    });

    it('should handle zero stargazers', () => {
      const repoWithZeroStars = { ...mockRepo, stargazers_count: 0 };
      const $reposList = DOMOperator.createRepositoriesList(
        [repoWithZeroStars],
        1,
      );
      const $repoElement = $reposList.children[0] as HTMLAnchorElement;
      const $star = $repoElement.querySelector('.star');

      expect($star?.textContent).toBe('0');
    });
  });

  describe('HTML escaping', () => {
    const testCases = [
      ['<script>', '&lt;script&gt;'],
      ['&', '&amp;'],
      ['"', '"'],
      ["'", "'"],
      ['<img src=x onerror=alert(1)>', '&lt;img src=x onerror=alert(1)&gt;'],
    ];

    it.each(testCases)('should properly escape: %s', (input, expected) => {
      const escaped = (DOMOperator as any).escapeHtml(input);
      expect(escaped).toBe(expected);
    });

    it('should handle empty string', () => {
      const escaped = (DOMOperator as any).escapeHtml('');
      expect(escaped).toBe('');
    });

    it('should handle normal text without special characters', () => {
      const input = 'Normal text 123';
      const escaped = (DOMOperator as any).escapeHtml(input);
      expect(escaped).toBe(input);
    });
  });
});
