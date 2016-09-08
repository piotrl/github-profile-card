namespace GitHubCard {

    export class GitHubCard {
        private apiLoader: GitHubApiLoader = new GitHubApiLoader();
        private $template: HTMLElement;
        private userData: IUserData;

        constructor(options: IMap<any>) {
            const widgetConfig = this.completeConfiguration(options);
            this.$template = this.findTemplate(widgetConfig);
            this.extractUsername(widgetConfig, this.$template);

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
        }

        private findTemplate(widgetConfig: IWidgetConfig): HTMLElement {
            const $template = <HTMLElement> document.querySelector(widgetConfig.template);
            if (!$template) {
                throw `No template found for selector: ${widgetConfig.template}`;
            }
            $template.className = 'gh-profile-card';
            return $template;
        }

        private extractUsername(widgetConfig: IWidgetConfig, $template: HTMLElement): void {
            widgetConfig.username = widgetConfig.username || $template.dataset['username'];

            if (!widgetConfig.username) {
                throw 'Not provided username';
            }
        }

        private init(options: IWidgetConfig): void {
            this.apiLoader.loadUserData(options.username, (data, err) => {
                this.userData = data;
                this.render(options, err);
            });
        }

        private render(options: IWidgetConfig, error?: IApiError): void {
            const $root = this.$template;

            // clear root template element to prepare space for widget
            DOMOperator.clearChildren($root);

            if (error) {
                const $errorSection = DOMOperator.createError(error, options.username);
                $root.appendChild($errorSection);

                return;
            }

            // API doesn't return errors, try to built widget
            const repositories = this.userData.repositories;
            this.sortRepositories(repositories, options.sortBy);

            const $profile = DOMOperator.createProfile(this.userData.profile);
            $profile.appendChild(this.createTopLanguagesSection(repositories));
            $root.appendChild($profile);

            if (options.maxRepos > 0) {
                const $reposHeader = DOMOperator.createRepositoriesHeader(options.reposHeaderText);
                const $reposList = DOMOperator.createRepositoriesList(repositories, options.maxRepos);
                $reposList.insertBefore($reposHeader, $reposList.firstChild);

                $root.appendChild($reposList);
            }
        }

        private createTopLanguagesSection(repositories: IApiRepository[]): HTMLUListElement {
            const $topLanguages = DOMOperator.createTopLanguagesSection();
            this.apiLoader.loadRepositoriesLanguages(repositories.slice(0, 10), langStats => {
                const languagesRank = this.groupLanguagesUsage(langStats);
                $topLanguages.innerHTML = DOMOperator.createTopLanguagesList(languagesRank);
            });
            return $topLanguages;
        }

        private groupLanguagesUsage(langStats: IMap<number>[]): IMap<number> {
            const languagesRank: IMap<number> = {};

            langStats.forEach(repoLangs => {
                for (const language in repoLangs) {
                    languagesRank[language] = languagesRank[language] || 0;
                    languagesRank[language] += repoLangs[language];
                }
            });

            return languagesRank;
        }

        private sortRepositories(repos: IApiRepository[], sortyBy: string): void {
            repos.sort((firstRepo, secondRepo) => {
                if (sortyBy === 'stars') {
                    const starDifference = secondRepo.stargazers_count - firstRepo.stargazers_count;
                    if (starDifference !== 0) {
                        return starDifference;
                    }
                }
                return this.dateDifference(secondRepo.updated_at, firstRepo.updated_at);
            });
        }

        private dateDifference(first: string, second: string) {
            return new Date(first).getTime() - new Date(second).getTime();
        }
    }
}