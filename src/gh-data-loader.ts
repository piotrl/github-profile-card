namespace GitHubCard {

    import IApiError = GitHubCard.IApiError;
    export class GitHubApiLoader {
        private apiBase: string = 'https://api.github.com';

        public loadUserData(username: string, callback: IApiCallback<IUserData>): void {
            const request = this.apiGet(`${this.apiBase}/users/${username}`);

            request.success(profile => {
                this.apiGet(profile.repos_url)
                    .success(repositories => {
                        const languagesUrls = this.extractLangURLs(repositories);
                        callback({profile, repositories, languagesUrls}, null);
                    });
            });

            request.error((result, request) => {
                const error = this.identifyError(result, request);
                callback(null, error);
            });
        }


        public loadRepositoriesLanguages(langUrls: string[], callback: (rank: IMap<number>[]) => void): void {
            const langStats = [];

            langUrls
                .map(repoLangUrl => this.apiGet(repoLangUrl))
                .forEach(request => {
                    request.success((repoLangs: IMap<number>) => {
                        langStats.push(repoLangs);
                        if (langStats.length === langUrls.length) { // all requests were made
                            callback(langStats);
                        }
                    });
                });
        }

        private identifyError(result: any, request: XMLHttpRequest): IApiError {
            const error: IApiError = {
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

        private extractLangURLs(profileRepositories: IApiRepository[]): string[] {
            return profileRepositories.map(repository => repository.languages_url);
        }

        private apiGet(url): IJqueryDeferredLike<any> {
            const request = this.buildRequest(url);

            return {
                success(callback) {
                    request.addEventListener('load', () => {
                        if (request.status === 304) {
                            callback(CacheStorage.get(url).data, request);
                        }
                        if (request.status === 200) {
                            const response = JSON.parse(request.responseText);
                            CacheStorage.add(url, {
                                lastModified: request.getResponseHeader('Last-Modified'),
                                data: response
                            });
                            callback(response, request);
                        }
                    });
                },
                error(callback) {
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

        private buildApiHeaders(request: XMLHttpRequest, url: string) {
            request.setRequestHeader('Accept', 'application/vnd.github.v3+json');

            const urlCache = CacheStorage.get(url);
            if (urlCache) {
                request.setRequestHeader('If-Modified-Since', urlCache.lastModified);
            }
        }
    }
}