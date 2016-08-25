class GitHubCard {
    private $template: HTMLElement;
    private profileData: IApiProfile;
    private repos: IApiRepository[];
    private url: IApiUrls;

    constructor(options: IMap<any>) {
        const widgetConfig = this.completeConfiguration(options);
        this.$template = this.findTemplate(widgetConfig);
        this.setUsername(widgetConfig, this.$template);

        this.init(widgetConfig);
    }

    public refresh(options: IWidgetConfig) {
        options = this.completeConfiguration(options);
        this.render(options);
    }

    private completeConfiguration(options?: IMap<any>): IWidgetConfig {
        const defaultConfig = {
            username: null,
            template: '#github-card',
            sortBy: 'stars', // possible: 'stars', 'updateTime'
            reposHeaderText: 'Most starred',
            maxRepos: 5,
            githubIcon: false
        };
        if (!options) {
            return defaultConfig;
        }
        for (const key in defaultConfig) {
            defaultConfig[key] = options[key] || defaultConfig[key];
        }

        return defaultConfig;
    };

    private findTemplate(widgetConfig: IWidgetConfig): HTMLElement {
        const $template = <HTMLElement> document.querySelector(widgetConfig.template);
        if (!$template) {
            throw `No template found for selector: ${widgetConfig.template}`;
        }
        $template.className = 'gh-profile-card';
        return $template;
    }

    private setUsername(widgetConfig: IWidgetConfig, $template: HTMLElement): void {
        widgetConfig.username = widgetConfig.username || $template.dataset['username'];

        if (!widgetConfig.username) {
            throw 'Not provided username';
        }
    }

    private init(options: IWidgetConfig): void {
        const apiLoader = new GitHubApiLoader(options.username);
        apiLoader.getData(err => {
            this.profileData = apiLoader.getProfile();
            this.repos = apiLoader.getRepos();
            this.url = apiLoader.getURLs();
            this.render(options, err);
        });
    }

    private getTopLanguages(langUrls: string[], callback: (rank: IMap<number>[]) => void) {
        const langStats = []; // array of URL strings

        // get URLs with language stats for each repository
        langUrls.forEach(apiURL => {
            const request = new XMLHttpRequest();
            request.addEventListener('load', calcResponse, false);
            request.open('GET', apiURL, true);
            request.send(null);
        });

        function calcResponse(loadEvent: Event): void {
            const response = (<any> loadEvent.target).responseText;
            const repoLangs: IMap<number> = JSON.parse(response);
            langStats.push(repoLangs);

            if (langStats.length === langUrls.length) { // all requests were made
                callback(langStats);
            }
        }
    }

    public render(options: IWidgetConfig, error?: IApiError): void {
        const $root = this.$template;
        const repositories = this.repos;

        // clear root template element to prepare space for widget
        DOMOperator.clearChildren($root);

        if (error) {
            const $errorSection = DOMOperator.createError(error, options.username);
            $root.appendChild($errorSection);

            return;
        }

        // API doesn't return errors, try to built widget
        const $profile = DOMOperator.createProfile(this.profileData);

        this.getTopLanguages(this.url.langs, langStats => {
            const languagesRank = this.flattenLanguagesStats(langStats);
            $profile.appendChild(
                DOMOperator.createTopLanguages(languagesRank)
            );
        });

        $root.appendChild($profile);

        if (options.maxRepos > 0) {
            this.sortRepositories(repositories, options.sortBy);

            const $reposHeader = DOMOperator.createRepositoriesHeader(options.reposHeaderText);
            const $reposList = DOMOperator.createRepositoriesList(repositories, options.maxRepos);
            $reposList.insertBefore($reposHeader, $reposList.firstChild);

            $root.appendChild($reposList);
        }
    }

    private flattenLanguagesStats(langStats: IMap<number>[]): IMap<number> {
        const languagesRank: IMap<number> = {};

        langStats.forEach(repoLangs => {
            let sum = 0;

            for (const k in repoLangs) {
                sum += repoLangs[k] || 0;
                languagesRank[k] = languagesRank[k] || 0;
                languagesRank[k] += repoLangs[k] / (sum * 1.00);
            }
        });

        return languagesRank;
    }

    private sortRepositories(repos: IApiRepository[], sortyBy: string): void {
        repos.sort(function (a, b) {
            // sorted by last commit
            if (sortyBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
            } else {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });
    }
}
