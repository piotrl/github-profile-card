class GitHubApiLoader {
    private apiBase: string = 'https://api.github.com';

    constructor() {
    }

    getData(username: string, callback: IApiCallback<IUserData>): void {
        const request = this.apiGet(`${this.apiBase}/users/${username}`);

        request.success(profile => {
            this.apiGet(profile.repos_url)
                .success(repositories => {
                    const languagesUrls = this.extractLangURLs(repositories);
                    callback({ profile, repositories, languagesUrls}, null);
                });
        });

        request.error((result, request) => {
            const error = this.checkSpecifiedError(result, request);
            callback(null, error);
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

    private extractLangURLs(profileRepositories: IApiRepository[]): string[] {
        return profileRepositories.map(repository => repository.languages_url);
    }

    private apiGet(url): IJqueryDeferredLike<any> {
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
        request.open('GET', url);
        request.send();

        return request;
    }
}
