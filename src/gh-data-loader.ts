const API_USERS_URL = 'https://api.github.com/users/';

class GitHubApiLoader {
    private userName: string;
    private url: IApiUrls;
    private error: IApiError;
    private repos: IApiRepository[];
    private profile: IApiProfile;

    constructor(userName: string) {
        this.userName = userName;
        this.url = {
            api: API_USERS_URL + userName,
            langs: []
        };
        this.error = null;
    }

    getRepos(): IApiRepository[] {
        return this.repos;
    }

    getProfile(): IApiProfile {
        return this.profile;
    }

    getURLs(): IApiUrls {
        return this.url;
    }

    getData(callback): void {
        const xhrHandler = this.loadJSON(this.url.api);

        xhrHandler.success(result => {
            this.profile = result;

            this.loadJSON(this.profile.repos_url)
                .success(repos => {
                    this.repos = repos;
                    this.url.langs = this.getLangURLs(this.repos);
                    callback();
                });
        });

        xhrHandler.error((result, request) => {
            const error = this.checkSpecifiedError(result, request);
            callback(error);
        });
    }

    private checkSpecifiedError(result: any, request: XMLHttpRequest): IApiError {
        const error: IApiError = {
            message: result.message
        };

        if (request.status === 404) {
            error.isWrongUser = true;
        }

        const limitRequests = request.getResponseHeader('X-RateLimit-Remaining');
        if (Number(limitRequests) === 0) {
            // API is blocked
            const resetTime = request.getResponseHeader('X-RateLimit-Reset');
            error.resetDate = new Date(Number(resetTime) * 1000);

            // full message is too long, leave only important thing
            error.message = error.message.split('(')[0];
        }

        return error;
    }

    private getLangURLs(profileRepositories: IApiRepository[]): string[] {
        return profileRepositories.map(repository => repository.languages_url);
    }

    private loadJSON(url): IJqueryDeferredLike {
        const request = this.getURL(url);

        return {
            success(callback) {
                request.addEventListener('load', () => {
                    if (request.status === 200) {
                        callback(JSON.parse(request.responseText), request);
                    }
                });
            },
            error(callback) {
                request.addEventListener('load', () => {
                    if (request.status !== 200) {
                        callback(JSON.parse(request.responseText), request);
                    }
                });
            }
        };
    }

    private getURL(url: string): XMLHttpRequest {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.send();

        return request;
    }
}

