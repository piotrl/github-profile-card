/**
 * @jest-environment jsdom
 */
import { GitHubCardWidget } from './gh-profile-card';
import { GitHubApiLoader } from './gh-data-loader';
import { DOMOperator } from './gh-dom-operator';
import { ApiError, ApiRepository } from './interface/IGitHubApi';
import { WidgetConfig } from './interface/IWidget';
import { mockProfile, mockRepositories } from './testing/mock-github-data';

// Mock dependencies
jest.mock('./gh-data-loader');
jest.mock('./gh-dom-operator');

const MockGitHubApiLoader = GitHubApiLoader as jest.MockedClass<
  typeof GitHubApiLoader
>;
const MockDOMOperator = DOMOperator as jest.MockedClass<typeof DOMOperator>;

describe('GitHubCardWidget', () => {
  let mockApiLoader: jest.Mocked<GitHubApiLoader>;
  let widget: GitHubCardWidget;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup DOM
    document.body.innerHTML =
      '<div id="github-card" data-username="testuser"></div>';

    // Mock API loader
    mockApiLoader = {
      loadUserData: jest.fn(),
      loadRepositoriesLanguages: jest.fn(),
    } as any;

    MockGitHubApiLoader.mockImplementation(() => mockApiLoader);

    // Mock DOM Operator static methods
    MockDOMOperator.clearChildren = jest.fn();
    MockDOMOperator.createError = jest
      .fn()
      .mockReturnValue(document.createElement('div'));
    MockDOMOperator.createProfile = jest
      .fn()
      .mockReturnValue(document.createElement('div'));
    MockDOMOperator.createTopLanguagesSection = jest
      .fn()
      .mockReturnValue(document.createElement('ul'));
    MockDOMOperator.createTopLanguagesList = jest
      .fn()
      .mockReturnValue('<li>TypeScript</li>');
    MockDOMOperator.createRepositoriesHeader = jest
      .fn()
      .mockReturnValue(document.createElement('span'));
    MockDOMOperator.createRepositoriesList = jest
      .fn()
      .mockReturnValue(document.createElement('div'));
  });

  describe('constructor', () => {
    it('should initialize widget with default options', () => {
      // Given - default setup is already in beforeEach

      // When
      const result = new GitHubCardWidget();

      // Then
      expect(result).toBeDefined();
    });

    it('should initialize widget with custom options', () => {
      // Given
      const options: WidgetConfig = {
        username: 'customuser',
        template: '#custom-template',
        sortBy: 'updateTime',
        headerText: 'Latest repositories',
        maxRepos: 3,
        hideTopLanguages: true,
      };
      document.body.innerHTML =
        '<div id="custom-template" data-username="fallback"></div>';

      // When
      const result = new GitHubCardWidget(options);

      // Then
      expect(result).toBeDefined();
    });

    it('should extract configuration from HTML data attributes', () => {
      // Given
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="htmluser"
             data-sort-by="updateTime"
             data-header-text="Custom Header"
             data-max-repos="3"
             data-hide-top-languages="true">
        </div>
      `;

      // When
      const result = new GitHubCardWidget();

      // Then
      expect(result).toBeDefined();
    });

    it('should throw error when template is not found', () => {
      // Given
      const options = { template: '#non-existent' };

      // When & Then
      expect(() => new GitHubCardWidget(options)).toThrow(
        'No template found for selector: #non-existent',
      );
    });

    it('should throw error when username is not provided', () => {
      // Given
      document.body.innerHTML = '<div id="github-card"></div>';

      // When & Then
      expect(() => new GitHubCardWidget()).toThrow(
        'Username is required but not provided',
      );
    });

    it('should handle invalid maxRepos data attribute gracefully', () => {
      // Given
      document.body.innerHTML =
        '<div id="github-card" data-username="testuser" data-max-repos="invalid"></div>';

      // When
      const result = new GitHubCardWidget();

      // Then
      expect(result).toBeDefined();
    });
  });

  describe('init', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should load user data successfully', async () => {
      // Given
      const userData = { profile: mockProfile, repositories: mockRepositories };
      mockApiLoader.loadUserData.mockResolvedValue(userData);

      // When
      await widget.init();

      // Then
      expect(mockApiLoader.loadUserData).toHaveBeenCalledWith('testuser');
    });

    it('should clear DOM children during initialization', async () => {
      // Given
      const userData = { profile: mockProfile, repositories: mockRepositories };
      mockApiLoader.loadUserData.mockResolvedValue(userData);

      // When
      await widget.init();

      // Then
      expect(MockDOMOperator.clearChildren).toHaveBeenCalled();
    });

    it('should render profile after successful data load', async () => {
      // Given
      const userData = { profile: mockProfile, repositories: mockRepositories };
      mockApiLoader.loadUserData.mockResolvedValue(userData);

      // When
      await widget.init();

      // Then
      expect(MockDOMOperator.createProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle API errors during initialization', async () => {
      // Given
      const error: ApiError = {
        message: 'API Error',
        isWrongUser: false,
      };
      mockApiLoader.loadUserData.mockRejectedValue(error);

      // When
      widget.init();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Then
      expect(MockDOMOperator.createError).toHaveBeenCalledWith(
        error,
        'testuser',
      );
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      (widget as any).userData = {
        profile: mockProfile,
        repositories: mockRepositories,
      };
    });

    it('should clear DOM children when refreshing', () => {
      // Given
      const newOptions: WidgetConfig = { sortBy: 'updateTime', maxRepos: 3 };

      // When
      widget.refresh(newOptions);

      // Then
      expect(MockDOMOperator.clearChildren).toHaveBeenCalled();
    });
  });

  describe('sorting functionality', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      (widget as any).userData = {
        profile: mockProfile,
        repositories: [...mockRepositories],
      };
    });

    it('should sort repositories by stars correctly', () => {
      // Given
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos = [...mockRepositories];

      // When
      sortRepos(repos, 'stars');

      // Then
      const firstRepoStars = repos[0].stargazers_count;
      expect(firstRepoStars).toBe(20);
    });

    it('should place higher starred repository first', () => {
      // Given
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos = [...mockRepositories];

      // When
      sortRepos(repos, 'stars');

      // Then
      const isCorrectOrder =
        repos[0].stargazers_count >= repos[1].stargazers_count;
      expect(isCorrectOrder).toBe(true);
    });

    it('should sort by update time when stars are equal', () => {
      // Given
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos = mockRepositories.map((repo) => ({
        ...repo,
        stargazers_count: 10,
      }));

      // When
      sortRepos(repos, 'stars');

      // Then
      const isNewerFirst =
        new Date(repos[0].updated_at) >= new Date(repos[1].updated_at);
      expect(isNewerFirst).toBe(true);
    });

    it('should handle empty repositories array without error', () => {
      // Given
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos: ApiRepository[] = [];

      // When & Then
      expect(() => sortRepos(repos, 'stars')).not.toThrow();
    });

    it('should handle null repositories array without error', () => {
      // Given
      const sortRepos = (widget as any).sortRepositories.bind(widget);

      // When & Then
      expect(() => sortRepos(null, 'stars')).not.toThrow();
    });
  });

  describe('language statistics', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should group language usage correctly', () => {
      // Given
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);
      const langStats = [
        { TypeScript: 1000, JavaScript: 500 },
        { TypeScript: 200, Python: 800 },
        { JavaScript: 300 },
      ];

      // When
      const result = groupLanguages(langStats);

      // Then
      expect(result).toEqual({
        TypeScript: 1200,
        JavaScript: 800,
        Python: 800,
      });
    });

    it('should return empty object for empty language statistics', () => {
      // Given
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);

      // When
      const result = groupLanguages([]);

      // Then
      expect(result).toEqual({});
    });

    it('should filter out invalid language statistics', () => {
      // Given
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);
      const langStats = [
        null,
        { TypeScript: 'invalid' },
        { JavaScript: 500 },
        undefined,
        { Python: -100 },
      ];

      // When
      const result = groupLanguages(langStats);

      // Then
      expect(result).toEqual({ JavaScript: 500 });
    });

    it('should create top languages section for empty repositories', () => {
      // Given
      const createSection = (widget as any).createTopLanguagesSection.bind(
        widget,
      );

      // When
      createSection([]);

      // Then
      expect(MockDOMOperator.createTopLanguagesSection).toHaveBeenCalled();
    });
  });

  describe('date difference calculation', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should calculate date difference correctly', () => {
      // Given
      const dateDiff = (widget as any).dateDifference.bind(widget);

      // When
      const result = dateDiff('2023-01-02T00:00:00Z', '2023-01-01T00:00:00Z');

      // Then
      expect(result).toBe(24 * 60 * 60 * 1000);
    });

    it('should return zero for invalid first date', () => {
      // Given
      const dateDiff = (widget as any).dateDifference.bind(widget);

      // When
      const result = dateDiff('invalid-date', '2023-01-01T00:00:00Z');

      // Then
      expect(result).toBe(0);
    });

    it('should return zero for both invalid dates', () => {
      // Given
      const dateDiff = (widget as any).dateDifference.bind(widget);

      // When
      const result = dateDiff('invalid', 'also-invalid');

      // Then
      expect(result).toBe(0);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      (widget as any).userData = {
        profile: mockProfile,
        repositories: mockRepositories,
      };
    });

    it('should render error when error is provided', () => {
      // Given
      const render = (widget as any).render.bind(widget);
      const error: ApiError = { message: 'Test error' };

      // When
      render({ username: 'testuser' }, error);

      // Then
      expect(MockDOMOperator.createError).toHaveBeenCalledWith(
        error,
        'testuser',
      );
    });

    it('should render profile when no error occurs', () => {
      // Given
      const render = (widget as any).render.bind(widget);
      const config = {
        username: 'testuser',
        maxRepos: 5,
        hideTopLanguages: false,
        headerText: 'Repositories',
        sortBy: 'stars',
      };

      // When
      render(config);

      // Then
      expect(MockDOMOperator.createProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should render repositories list when no error occurs', () => {
      // Given
      const render = (widget as any).render.bind(widget);
      const config = {
        username: 'testuser',
        maxRepos: 5,
        hideTopLanguages: false,
        headerText: 'Repositories',
        sortBy: 'stars',
      };

      // When
      render(config);

      // Then
      expect(MockDOMOperator.createRepositoriesList).toHaveBeenCalledWith(
        mockRepositories,
        5,
      );
    });

    it('should skip repositories section when maxRepos is zero', () => {
      // Given
      const render = (widget as any).render.bind(widget);
      const config = {
        username: 'testuser',
        maxRepos: 0,
        hideTopLanguages: true,
      };

      // When
      render(config);

      // Then
      expect(MockDOMOperator.createRepositoriesList).not.toHaveBeenCalled();
    });

    it('should skip top languages when hideTopLanguages is true', () => {
      // Given
      const render = (widget as any).render.bind(widget);
      const config = {
        username: 'testuser',
        hideTopLanguages: true,
      };

      // When
      render(config);

      // Then
      expect(MockDOMOperator.createTopLanguagesSection).not.toHaveBeenCalled();
    });
  });
});
