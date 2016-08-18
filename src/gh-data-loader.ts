
const API_USERS_URL = 'https://api.github.com/users/';

class GitHubApiLoader {
    private userName: string;
    private url: IApiUrls;
    private error: IApiError;
    private repos;
    private profile: IApiProfile;

    constructor(userName) {
        this.userName = userName;
        this.url = {
            api: API_USERS_URL + userName,
            langs: []
        };
        this.error = null;
    }

    getRepos() {
        return this.repos;
    }

    getProfile(): IApiProfile {
        return this.profile;
    }

    getURLs(): IApiUrls {
        return this.url;
    }

    getData(callback) {
        const context = this;
        const handler = loadJSON(this.url.api);

        handler.success(result => {
            context.profile = result;

            loadJSON(result.repos_url)
                .success(repos => {
                    context.repos = repos;
                    context.url.langs = getLangURLs(repos);
                    callback();
                });
        });

        handler.error((result, request) => {
            const error = {
                message: result.message
            };
            checkSpecifiedError(error, request);
            callback(error);
        });
    }
}

/////////////////////////////
// Private
//

function checkSpecifiedError(error: IApiError, request: XMLHttpRequest) {
    if (request.status === 404) {
        error.isWrongUser = true;
    }

    const limitRequests = request.getResponseHeader('X-RateLimit-Remaining');
    if (Number(limitRequests) === 0) {
        // API is blocked
        const resetTime: string = request.getResponseHeader('X-RateLimit-Reset');
        error.resetDate = new Date(parseInt(resetTime, 10) * 1000);

        // full message is too long, leave only important thing
        error.message = error.message.split('(')[0];
    }
}

function getLangURLs(repos) {
    const langApiUrls = [];

    for (const k in repos) {
        langApiUrls.push(repos[k].languages_url);
    }

    return langApiUrls;
}

function loadJSON(url) {
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

function getURL(url) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send();

    return request;
}
