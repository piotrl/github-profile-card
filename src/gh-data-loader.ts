import { CacheStorage } from './gh-cache-storage';
import { ApiUserData } from './interface/IWidget';
import {
  ApiCallback,
  ApiError,
  ApiRepository
} from './interface/IGitHubApi';
import { JqueryDeferred } from './interface/IShared';

export class GitHubApiLoader {
  private apiBase = 'https://api.github.com';
  private cache = new CacheStorage(window.localStorage);

  public loadUserData(
    username: string,
    callback: ApiCallback<ApiUserData>
  ): void {
    const request = this.apiGet(`${this.apiBase}/users/${username}`);

    request.success(profile => {
      this.apiGet(profile.repos_url).success(repositories => {
        callback({ profile, repositories }, null);
      });
    });

    request.error((result, request) => {
      const error = this.identifyError(result, request);
      callback(null, error);
    });
  }

  public loadRepositoriesLanguages(
    repositories: ApiRepository[],
    callback: (rank: Record<string, number>[]) => void
  ): void {
    const languagesUrls = this.extractLangURLs(repositories);

    const langStats = [];
    let requestsAmount = languagesUrls.length;

    languagesUrls.forEach(repoLangUrl => {
      const request = this.apiGet(repoLangUrl);
      request.error(() => requestsAmount--);
      request.success((repoLangs: Record<string, number>) => {
        langStats.push(repoLangs);
        if (langStats.length === requestsAmount) {
          // all requests were made
          callback(langStats);
        }
      });
    });
  }

  private identifyError(result: any, request: XMLHttpRequest): ApiError {
    const error: ApiError = {
      message: result.message
    };

    if (request.status === 404) {
      error.isWrongUser = true;
    }

    const limitRequests = request.getResponseHeader('X-RateLimit-Remaining');
    if (Number(limitRequests) === 0) {
      const resetTime = request.getResponseHeader('X-RateLimit-Reset');
      error.resetDate = new Date(Number(resetTime) * 1000);

      // full message is too long, leave only general message
      error.message = error.message.split('(')[0];
    }

    return error;
  }

  private extractLangURLs(profileRepositories: ApiRepository[]): string[] {
    return profileRepositories.map(repository => repository.languages_url);
  }

  private apiGet(url): JqueryDeferred<any> {
    const request = this.buildRequest(url);

    return {
      success: callback => {
        request.addEventListener('load', () => {
          if (request.status === 304) {
            callback(this.cache.get(url).data, request);
          }
          if (request.status === 200) {
            const response = JSON.parse(request.responseText);
            this.cache.add(url, {
              lastModified: request.getResponseHeader('Last-Modified'),
              data: response
            });
            callback(response, request);
          }
        });
      },
      error: callback => {
        request.addEventListener('load', () => {
          if (request.status !== 200 && request.status !== 304) {
            callback(JSON.parse(request.responseText), request);
          }
        });
      }
    };
  }

  private buildRequest(url: string): XMLHttpRequest {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    this.buildApiHeaders(request, url);
    request.send();

    return request;
  }

  private buildApiHeaders(request: XMLHttpRequest, url: string): void {
    request.setRequestHeader('Accept', 'application/vnd.github.v3+json');

    const urlCache = this.cache.get(url);
    if (urlCache) {
      request.setRequestHeader('If-Modified-Since', urlCache.lastModified);
    }
  }
}
