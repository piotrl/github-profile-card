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
        const context = this;
        const xhrHandler = loadJSON(this.url.api);

        xhrHandler.success(result => {
            context.profile = result;

            loadJSON(context.profile.repos_url)
                .success(repos => {
                    context.repos = repos;
                    context.url.langs = getLangURLs(context.repos);
                    callback();
                });
        });

        xhrHandler.error((result, request) => {
            const error = checkSpecifiedError(result, request);
            callback(error);
        });
    }
}

/////////////////////////////
// Private
//

function checkSpecifiedError(result: any, request: XMLHttpRequest): IApiError {
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
        error.resetDate = new Date(parseInt(resetTime, 10) * 1000);

        // full message is too long, leave only important thing
        error.message = error.message.split('(')[0];
    }

    return error;
}

function getLangURLs(profileRepositories: IApiRepository[]): string[] {
    return profileRepositories.map(repository => repository.languages_url);
}

function loadJSON(url): IJqueryDefferedLike {
    const request = getURL(url);

    return {
        success(callback) {
            request.addEventListener('load', () => {
                if (callback && request.status === 200) {
                    callback(JSON.parse(request.responseText));
                }
            });
        },
        error(callback) {
            request.addEventListener('load', () => {
                if (callback && request.status !== 200) {
                    const result = JSON.parse(request.responseText);
                    callback(result, request);
                }
            });
        }
    };
}

function getURL(url: string): XMLHttpRequest {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send();

    return request;
}
