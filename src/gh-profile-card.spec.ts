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

const MockGitHubApiLoader = GitHubApiLoader as jest.MockedClass<typeof GitHubApiLoader>;
const MockDOMOperator = DOMOperator as jest.MockedClass<typeof DOMOperator>;

describe('GitHubCardWidget', () => {
  let mockApiLoader: jest.Mocked<GitHubApiLoader>;
  let widget: GitHubCardWidget;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup DOM
    document.body.innerHTML = '<div id="github-card" data-username="testuser"></div>';

    // Mock API loader
    mockApiLoader = {
      loadUserData: jest.fn(),
      loadRepositoriesLanguages: jest.fn(),
    } as any;

    MockGitHubApiLoader.mockImplementation(() => mockApiLoader);

    // Mock DOM Operator static methods
    MockDOMOperator.clearChildren = jest.fn();
    MockDOMOperator.createError = jest.fn().mockReturnValue(document.createElement('div'));
    MockDOMOperator.createProfile = jest.fn().mockReturnValue(document.createElement('div'));
    MockDOMOperator.createTopLanguagesSection = jest.fn().mockReturnValue(document.createElement('ul'));
    MockDOMOperator.createTopLanguagesList = jest.fn().mockReturnValue('<li>TypeScript</li>');
    MockDOMOperator.createRepositoriesHeader = jest.fn().mockReturnValue(document.createElement('span'));
    MockDOMOperator.createRepositoriesList = jest.fn().mockReturnValue(document.createElement('div'));
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const widget = new GitHubCardWidget();
      expect(widget).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: WidgetConfig = {
        username: 'customuser',
        template: '#custom-template',
        sortBy: 'updateTime',
        headerText: 'Latest repositories',
        maxRepos: 3,
        hideTopLanguages: true,
      };

      document.body.innerHTML = '<div id="custom-template" data-username="fallback"></div>';
      
      const widget = new GitHubCardWidget(options);
      expect(widget).toBeDefined();
    });

    it('should extract configuration from HTML data attributes', () => {
      document.body.innerHTML = `
        <div id="github-card" 
             data-username="htmluser"
             data-sort-by="updateTime"
             data-header-text="Custom Header"
             data-max-repos="3"
             data-hide-top-languages="true">
        </div>
      `;

      const widget = new GitHubCardWidget();
      expect(widget).toBeDefined();
    });

    it('should throw error when template is not found', () => {
      expect(() => {
        new GitHubCardWidget({ template: '#non-existent' });
      }).toThrow('No template found for selector: #non-existent');
    });

    it('should throw error when username is not provided', () => {
      document.body.innerHTML = '<div id="github-card"></div>';
      
      expect(() => {
        new GitHubCardWidget();
      }).toThrow('Username is required but not provided');
    });

    it('should handle invalid maxRepos data attribute', () => {
      document.body.innerHTML = '<div id="github-card" data-username="testuser" data-max-repos="invalid"></div>';
      
      const widget = new GitHubCardWidget();
      expect(widget).toBeDefined();
    });
  });

  describe('init', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should load user data and render successfully', async () => {
      const userData = { profile: mockProfile, repositories: mockRepositories };
      mockApiLoader.loadUserData.mockResolvedValue(userData);

      await widget.init();

      expect(mockApiLoader.loadUserData).toHaveBeenCalledWith('testuser');
      expect(MockDOMOperator.clearChildren).toHaveBeenCalled();
      expect(MockDOMOperator.createProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle API errors during initialization', async () => {
      const error: ApiError = {
        message: 'API Error',
        isWrongUser: false,
      };
      
      mockApiLoader.loadUserData.mockRejectedValue(error);

      widget.init();

      // Wait for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(MockDOMOperator.createError).toHaveBeenCalledWith(error, 'testuser');
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      // Mock userData being set
      (widget as any).userData = { profile: mockProfile, repositories: mockRepositories };
    });

    it('should refresh widget with new options', () => {
      const newOptions: WidgetConfig = {
        sortBy: 'updateTime',
        maxRepos: 3,
      };

      widget.refresh(newOptions);

      expect(MockDOMOperator.clearChildren).toHaveBeenCalled();
    });
  });

  describe('sorting functionality', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      (widget as any).userData = { profile: mockProfile, repositories: [...mockRepositories] };
    });

    it('should sort repositories by stars', () => {
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos = [...mockRepositories];
      
      sortRepos(repos, 'stars');
      
      // First repo should have more stars (20 > 10)
      expect(repos[0].stargazers_count).toBe(20);
      expect(repos[1].stargazers_count).toBe(10);
    });

    it('should sort repositories by update time when stars are equal', () => {
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos = mockRepositories.map(repo => ({ ...repo, stargazers_count: 10 }));
      
      sortRepos(repos, 'stars');
      
      // More recently updated repo should come first
      expect(new Date(repos[0].updated_at) >= new Date(repos[1].updated_at)).toBe(true);
    });

    it('should handle empty repositories array', () => {
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      const repos: ApiRepository[] = [];
      
      expect(() => sortRepos(repos, 'stars')).not.toThrow();
    });

    it('should handle null repositories array', () => {
      const sortRepos = (widget as any).sortRepositories.bind(widget);
      
      expect(() => sortRepos(null, 'stars')).not.toThrow();
    });
  });

  describe('language statistics', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should group language usage correctly', () => {
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);
      const langStats = [
        { TypeScript: 1000, JavaScript: 500 },
        { TypeScript: 200, Python: 800 },
        { JavaScript: 300 },
      ];

      const result = groupLanguages(langStats);

      expect(result).toEqual({
        TypeScript: 1200,
        JavaScript: 800,
        Python: 800,
      });
    });

    it('should handle empty language statistics', () => {
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);
      
      const result = groupLanguages([]);
      expect(result).toEqual({});
    });

    it('should handle malformed language statistics', () => {
      const groupLanguages = (widget as any).groupLanguagesUsage.bind(widget);
      const langStats = [
        null,
        { TypeScript: 'invalid' },
        { JavaScript: 500 },
        undefined,
        { Python: -100 },
      ];

      const result = groupLanguages(langStats);

      expect(result).toEqual({
        JavaScript: 500,
      });
    });

    it('should create top languages section with empty repositories', () => {
      const createSection = (widget as any).createTopLanguagesSection.bind(widget);
      
      const result = createSection([]);
      expect(MockDOMOperator.createTopLanguagesSection).toHaveBeenCalled();
    });
  });

  describe('date difference calculation', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
    });

    it('should calculate date difference correctly', () => {
      const dateDiff = (widget as any).dateDifference.bind(widget);
      
      const result = dateDiff('2023-01-02T00:00:00Z', '2023-01-01T00:00:00Z');
      expect(result).toBe(24 * 60 * 60 * 1000); // 1 day in milliseconds
    });

    it('should handle invalid dates', () => {
      const dateDiff = (widget as any).dateDifference.bind(widget);
      
      const result = dateDiff('invalid-date', '2023-01-01T00:00:00Z');
      expect(result).toBe(0);
    });

    it('should handle both invalid dates', () => {
      const dateDiff = (widget as any).dateDifference.bind(widget);
      
      const result = dateDiff('invalid', 'also-invalid');
      expect(result).toBe(0);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      widget = new GitHubCardWidget();
      (widget as any).userData = { profile: mockProfile, repositories: mockRepositories };
    });

    it('should render error when error is provided', () => {
      const render = (widget as any).render.bind(widget);
      const error: ApiError = { message: 'Test error' };
      
      render({ username: 'testuser' }, error);
      
      expect(MockDOMOperator.createError).toHaveBeenCalledWith(error, 'testuser');
    });

    it('should render profile and repositories when no error', () => {
      const render = (widget as any).render.bind(widget);
      
      render({ 
        username: 'testuser',
        maxRepos: 5,
        hideTopLanguages: false,
        headerText: 'Repositories',
        sortBy: 'stars'
      });
      
      expect(MockDOMOperator.createProfile).toHaveBeenCalledWith(mockProfile);
      expect(MockDOMOperator.createRepositoriesList).toHaveBeenCalledWith(mockRepositories, 5);
    });

    it('should skip repositories section when maxRepos is 0', () => {
      const render = (widget as any).render.bind(widget);
      
      render({ 
        username: 'testuser',
        maxRepos: 0,
        hideTopLanguages: true,
      });
      
      expect(MockDOMOperator.createRepositoriesList).not.toHaveBeenCalled();
    });

    it('should skip top languages when hideTopLanguages is true', () => {
      const render = (widget as any).render.bind(widget);
      
      render({ 
        username: 'testuser',
        hideTopLanguages: true,
      });
      
      expect(MockDOMOperator.createTopLanguagesSection).not.toHaveBeenCalled();
    });
  });
});
