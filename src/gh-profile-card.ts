import { GitHubApiLoader } from './gh-data-loader';
import { DOMOperator } from './gh-dom-operator';
import { IUserData, IWidgetConfig } from './interface/IWidget';
import { IApiError, IApiRepository } from './interface/IGitHubApi';
import { IMap } from './interface/IShared';

export class GitHubCardWidget {
  private apiLoader: GitHubApiLoader = new GitHubApiLoader();
  private $template: HTMLElement;
  private userData: IUserData;
  private options: IWidgetConfig;

  constructor(options: IWidgetConfig = {}) {
    this.$template = this.findTemplate(options.template);
    this.extractHtmlConfig(options, this.$template);
    this.options = this.completeConfiguration(options);
  }

  public init(): void {
    this.apiLoader.loadUserData(this.options.username, (data, err) => {
      this.userData = data;
      this.render(this.options, err);
    });
  }

  public refresh(options: IWidgetConfig) {
    this.options = this.completeConfiguration(options);
    this.render(this.options);
  }

  private completeConfiguration(options: IWidgetConfig): IWidgetConfig {
    const defaultConfig = {
      username: null,
      template: '#github-card',
      sortBy: 'stars', // possible: 'stars', 'updateTime'
      headerText: 'Most starred repositories',
      maxRepos: 5,
      hideTopLanguages: false
    };
    for (const key in defaultConfig) {
      defaultConfig[key] = options[key] || defaultConfig[key];
    }

    return defaultConfig;
  }

  private findTemplate(
    templateCssSelector: string = '#github-card'
  ): HTMLElement {
    const $template = <HTMLElement>document.querySelector(templateCssSelector);
    if (!$template) {
      throw `No template found for selector: ${templateCssSelector}`;
    }
    $template.className = 'gh-profile-card';
    return $template;
  }

  private extractHtmlConfig(
    widgetConfig: IWidgetConfig,
    $template: HTMLElement
  ): void {
    widgetConfig.username =
      widgetConfig.username || $template.dataset['username'];
    widgetConfig.sortBy = widgetConfig.sortBy || $template.dataset['sortBy'];
    widgetConfig.headerText =
      widgetConfig.headerText || $template.dataset['headerText'];
    widgetConfig.maxRepos =
      widgetConfig.maxRepos || parseInt($template.dataset['maxRepos'], 10);
    widgetConfig.hideTopLanguages =
      widgetConfig.hideTopLanguages ||
      $template.dataset['hideTopLanguages'] === 'true';

    if (!widgetConfig.username) {
      throw 'Not provided username';
    }
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
    if (!options.hideTopLanguages) {
      $profile.appendChild(this.createTopLanguagesSection(repositories));
    }
    $root.appendChild($profile);

    if (options.maxRepos > 0) {
      const $reposHeader = DOMOperator.createRepositoriesHeader(
        options.headerText
      );
      const $reposList = DOMOperator.createRepositoriesList(
        repositories,
        options.maxRepos
      );
      $reposList.insertBefore($reposHeader, $reposList.firstChild);

      $root.appendChild($reposList);
    }
  }

  private createTopLanguagesSection(
    repositories: IApiRepository[]
  ): HTMLUListElement {
    const $topLanguages = DOMOperator.createTopLanguagesSection();
    this.apiLoader.loadRepositoriesLanguages(
      repositories.slice(0, 10),
      langStats => {
        const languagesRank = this.groupLanguagesUsage(langStats);
        $topLanguages.innerHTML = DOMOperator.createTopLanguagesList(
          languagesRank
        );
      }
    );
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
        const starDifference =
          secondRepo.stargazers_count - firstRepo.stargazers_count;
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
