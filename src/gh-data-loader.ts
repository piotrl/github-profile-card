import { CacheStorage, CacheEntry } from './gh-cache-storage';
import { ApiUserData } from './interface/IWidget';
import { ApiError, ApiProfile, ApiRepository } from './interface/IGitHubApi';

const API_HOST = 'https://api.github.com';

export class GitHubApiLoader {
  private cache = new CacheStorage(window.localStorage);

  public async loadUserData(username: string): Promise<ApiUserData> {
    if (typeof username !== 'string') {
      throw new Error('Invalid username provided');
    }

    const sanitizedUsername = username.trim();
    if (!sanitizedUsername) {
      throw new Error('Username cannot be empty');
    }

    const profile = await this.fetch<ApiProfile>(
      `${API_HOST}/users/${sanitizedUsername}`,
    );
    const repositories = await this.fetch<ApiRepository[]>(profile.repos_url);

    return { profile, repositories };
  }

  public loadRepositoriesLanguages(
    repositories: ApiRepository[],
    callback: (rank: Record<string, number>[]) => void,
  ): void {
    if (!repositories || repositories.length === 0) {
      callback([]);
      return;
    }

    const languagesUrls = this.extractLangURLs(repositories);
    const langStats: Record<string, number>[] = [];
    let requestsAmount = languagesUrls.length;
    let completedRequests = 0;

    if (requestsAmount === 0) {
      callback([]);
      return;
    }

    const handleCompletion = () => {
      completedRequests++;
      if (completedRequests === requestsAmount) {
        callback(langStats);
      }
    };

    languagesUrls.forEach((repoLangUrl) => {
      this.fetch<Record<string, number>>(repoLangUrl)
        .then((repoLangs) => {
          langStats.push(repoLangs || {});
          handleCompletion();
        })
        .catch((error) => {
          console.warn('Failed to load languages for repository:', error);
          langStats.push({});
          handleCompletion();
        });
    });
  }

  private async identifyError(response: Response): Promise<ApiError> {
    let result: any;
    try {
      result = await response.json();
    } catch (parseError) {
      result = { message: 'Failed to parse error response' };
    }

    const error: ApiError = {
      message: result.message || `HTTP ${response.status}: ${response.statusText}`,
    };

    if (response.status === 404) {
      error.isWrongUser = true;
    }

    const limitRequests = response.headers.get('X-RateLimit-Remaining');
    if (Number(limitRequests) === 0) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      if (resetTime) {
        error.resetDate = new Date(Number(resetTime) * 1000);
        // full message is too long, leave only general message
        error.message = error.message.split('(')[0];
      }
    }

    return error;
  }

  private extractLangURLs(profileRepositories: ApiRepository[]): string[] {
    return profileRepositories
      .filter((repo) => repo && repo.languages_url)
      .map((repository) => repository.languages_url);
  }

  private async fetch<T>(url: string): Promise<T> {
    if (typeof url !== 'string') {
      throw new Error('Invalid URL provided for fetch');
    }

    const cache = this.cache.get(url);
    
    let response: Response;
    try {
      response = await fetch(url, {
        headers: this.buildHeaders(cache),
      });
    } catch (networkError) {
      throw new Error(`Network error: ${networkError.message}`);
    }

    if (response.status === 304 && cache) {
      return cache.data;
    }
    
    if (response.status !== 200) {
      throw await this.identifyError(response);
    }

    let jsonResponse: T;
    try {
      jsonResponse = await response.json();
    } catch (parseError) {
      throw new Error('Failed to parse API response as JSON');
    }

    const lastModified = response.headers.get('Last-Modified');
    if (lastModified) {
      this.cache.add(url, {
        lastModified,
        data: jsonResponse,
      });
    }

    return jsonResponse;
  }

  private buildHeaders(cache?: CacheEntry): HeadersInit {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (cache?.lastModified) {
      headers['If-Modified-Since'] = cache.lastModified;
    }

    return headers;
  }
}
