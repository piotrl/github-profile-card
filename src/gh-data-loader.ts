import { CacheStorage, CacheEntry } from './gh-cache-storage';
import { ApiUserData } from './interface/IWidget';
import { ApiError, ApiProfile, ApiRepository } from './interface/IGitHubApi';

const API_HOST = 'https://api.github.com';

export class GitHubApiLoader {
  private cache = new CacheStorage(window.localStorage);

  public async loadUserData(username: string): Promise<ApiUserData> {
    const profile = await this.fetch<ApiProfile>(
      `${API_HOST}/users/${username}`,
    );
    const repositories = await this.fetch<ApiRepository[]>(profile.repos_url);

    return { profile, repositories };
  }

  public loadRepositoriesLanguages(
    repositories: ApiRepository[],
    callback: (rank: Record<string, number>[]) => void,
  ): void {
    const languagesUrls = this.extractLangURLs(repositories);

    const langStats = [];
    let requestsAmount = languagesUrls.length;

    languagesUrls.forEach((repoLangUrl) => {
      this.fetch<Record<string, number>>(repoLangUrl)
        .then((repoLangs) => {
          langStats.push(repoLangs);
          if (langStats.length === requestsAmount) {
            // all requests were made
            callback(langStats);
          }
        })
        .catch(() => () => {
          requestsAmount--;
        });
    });
  }

  private async identifyError(response: Response): Promise<ApiError> {
    const result = await response.json();
    const error: ApiError = {
      message: result.message || '',
    };

    if (response.status === 404) {
      error.isWrongUser = true;
    }

    const limitRequests = response.headers.get('X-RateLimit-Remaining');
    if (Number(limitRequests) === 0) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      error.resetDate = new Date(Number(resetTime) * 1000);

      // full message is too long, leave only general message
      error.message = error.message.split('(')[0];
    }

    return error;
  }

  private extractLangURLs(profileRepositories: ApiRepository[]): string[] {
    return profileRepositories.map((repository) => repository.languages_url);
  }

  private async fetch<T>(url: string): Promise<T> {
    const cache = this.cache.get(url);
    const res = await fetch(url, {
      headers: this.buildHeaders(cache),
    });

    if (res.status === 304) {
      return cache.data;
    }
    if (res.status !== 200) {
      throw await this.identifyError(res);
    }

    const response = await res.json();
    this.cache.add(url, {
      lastModified: res.headers.get('Last-Modified'),
      data: response,
    });

    return response;
  }

  private buildHeaders(cache?: CacheEntry): HeadersInit {
    return {
      Accept: 'application/vnd.github.v3+json',
      'If-Modified-Since': cache?.lastModified,
    };
  }
}
