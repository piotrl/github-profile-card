let username;

const autoComplete = (options: any): IWidgetConfig => {
    const defaultConfig = {
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
        options[key] = options[key] || defaultConfig[key];
    }

    return options;
};

class GitHubCard {
    private $template: HTMLElement;
    private profileData: IApiProfile;
    private repos;
    private url: IApiUrls;

    constructor(options) {
        options = autoComplete(options);
        this.$template = <HTMLElement> document.querySelector(options.template);

        username = options.userName || this.$template.dataset['username'];

        this.profileData = null;
        this.repos = {};

        // load resources and render widget
        this.init(options);
    }

    init(options) {
        const apiLoader = new GitHubApiLoader(username);
        const self = this;
        apiLoader.getData(err => {
            self.profileData = apiLoader.getProfile();
            self.repos = apiLoader.getRepos();
            self.url = apiLoader.getURLs();
            self.render(options, err);
        });
        this.$template.className = 'gh-profile-card';
    }

    getTopLanguages(callback: Function) {
        const langStats = []; // array of URL strings
        const langUrls = this.url.langs;

        // get URLs with language stats for each repository
        langUrls.forEach(apiURL => {
            const request = new XMLHttpRequest();
            request.addEventListener('load', calcResponse, false);
            request.open('GET', apiURL, true);
            request.send(null);
        });

        function calcResponse(loadEvent) {
            const response = loadEvent.target.responseText;
            const repoLangs = JSON.parse(response);
            langStats.push(repoLangs);

            if (langStats.length === langUrls.length) { // all requests were made
                const languagesRank = calcPopularity(langStats);
                callback(languagesRank);
            }
        }
    }

    render(options: IWidgetConfig, error?: IApiError) {
        const $root = this.$template;
        const repositories = this.repos;

        // clear root template element to prepare space for widget
        DOMOperator.clearChildren($root);

        if (error) {
            const $errorSection = DOMOperator.createError(error, username);
            $root.appendChild($errorSection);

            return;
        }

        // API doesn't return errors, try to built widget
        const $profile = DOMOperator.createProfile(this.profileData);

        this.getTopLanguages(langs => {
            $profile.appendChild(
                DOMOperator.createTopLanguages(langs)
            );
        });

        $root.appendChild($profile);

        if (options.maxRepos > 0) {
            const $reposHeader = DOMOperator.createReposHeader(options.reposHeaderText);
            const $reposList = DOMOperator.createReposList(repositories, options.sortBy, options.maxRepos);
            $reposList.insertBefore($reposHeader, $reposList.firstChild);

            $root.appendChild($reposList);
        }
    }

    refresh(options: IWidgetConfig) {
        options = autoComplete(options);
        this.render(options);
    }
}

// give rank (weights) to the language
function calcPopularity(langStats) {
    const languagesRank = {};

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
