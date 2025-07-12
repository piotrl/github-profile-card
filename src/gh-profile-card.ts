import { GitHubApiLoader } from './gh-data-loader';
import { DOMOperator } from './gh-dom-operator';
import { ApiUserData, WidgetConfig } from './interface/IWidget';
import { ApiError, ApiRepository } from './interface/IGitHubApi';

export class GitHubCardWidget {
  private apiLoader: GitHubApiLoader = new GitHubApiLoader();
  private $template: HTMLElement;
  private userData: ApiUserData;
  private options: WidgetConfig;

  constructor(options: WidgetConfig = {}) {
    this.$template = this.findTemplate(options.template);
    this.extractHtmlConfig(options, this.$template);
    this.options = this.completeConfiguration(options);
  }

  public init(): void {
    this.apiLoader
      .loadUserData(this.options.username)
      .then((data) => {
        this.userData = data;
        this.render(this.options);
      })
      .catch((err) => {
        this.render(this.options, err);
      });
  }

  public refresh(options: WidgetConfig): void {
    this.options = this.completeConfiguration(options);
    this.render(this.options);
  }

  private completeConfiguration(options: WidgetConfig): WidgetConfig {
    const defaultConfig: Required<WidgetConfig> = {
      username: '',
      template: '#github-card',
      sortBy: 'stars', // possible: 'stars', 'updateTime'
      headerText: 'Most starred repositories',
      maxRepos: 5,
      hideTopLanguages: false,
    };

    return {
      ...defaultConfig,
      ...options,
    };
  }

  private findTemplate(templateCssSelector = '#github-card'): HTMLElement {
    const $template = document.querySelector(
      templateCssSelector,
    ) as HTMLElement;
    if (!$template) {
      throw new Error(`No template found for selector: ${templateCssSelector}`);
    }
    $template.className = 'gh-profile-card';
    return $template;
  }

  private extractHtmlConfig(
    widgetConfig: WidgetConfig,
    $template: HTMLElement,
  ): void {
    const dataset = $template.dataset;
    
    widgetConfig.username = widgetConfig.username || dataset.username;
    widgetConfig.sortBy = widgetConfig.sortBy || dataset.sortBy;
    widgetConfig.headerText = widgetConfig.headerText || dataset.headerText;
    
    if (dataset.maxRepos) {
      const parsedMaxRepos = parseInt(dataset.maxRepos, 10);
      if (!isNaN(parsedMaxRepos)) {
        widgetConfig.maxRepos = widgetConfig.maxRepos || parsedMaxRepos;
      }
    }
    
    widgetConfig.hideTopLanguages =
      widgetConfig.hideTopLanguages || dataset.hideTopLanguages === 'true';

    if (!widgetConfig.username) {
      throw new Error('Username is required but not provided');
    }
  }

  private render(options: WidgetConfig, error?: ApiError): void {
    const $root = this.$template;

    // clear root template element to prepare space for widget
    DOMOperator.clearChildren($root);

    if (error) {
      const $errorSection = DOMOperator.createError(error, options.username || '');
      $root.appendChild($errorSection);
      return;
    }

    // API doesn't return errors, try to build widget
    const repositories = this.userData.repositories;
    this.sortRepositories(repositories, options.sortBy || 'stars');

    const $profile = DOMOperator.createProfile(this.userData.profile);
    if (!options.hideTopLanguages) {
      $profile.appendChild(this.createTopLanguagesSection(repositories));
    }
    $root.appendChild($profile);

    if ((options.maxRepos || 0) > 0) {
      const $reposHeader = DOMOperator.createRepositoriesHeader(
        options.headerText || 'Repositories',
      );
      const $reposList = DOMOperator.createRepositoriesList(
        repositories,
        options.maxRepos || 5,
      );
      $reposList.insertBefore($reposHeader, $reposList.firstChild);

      $root.appendChild($reposList);
    }
  }

  private createTopLanguagesSection(
    repositories: ApiRepository[],
  ): HTMLUListElement {
    const $topLanguages = DOMOperator.createTopLanguagesSection();
    
    if (!repositories || repositories.length === 0) {
      return $topLanguages;
    }

    this.apiLoader.loadRepositoriesLanguages(
      repositories.slice(0, 10),
      (langStats) => {
        if (langStats.length > 0) {
          const languagesRank = this.groupLanguagesUsage(langStats);
          $topLanguages.innerHTML = DOMOperator.createTopLanguagesList(languagesRank);
        }
      },
    );
    return $topLanguages;
  }

  private groupLanguagesUsage(
    langStats: Record<string, number>[],
  ): Record<string, number> {
    const languagesRank: Record<string, number> = {};

    langStats.forEach((repoLangs) => {
      if (repoLangs && typeof repoLangs === 'object') {
        Object.entries(repoLangs).forEach(([language, bytes]) => {
          if (typeof bytes === 'number' && bytes > 0) {
            languagesRank[language] = (languagesRank[language] || 0) + bytes;
          }
        });
      }
    });

    return languagesRank;
  }

  private sortRepositories(repos: ApiRepository[], sortBy: string): void {
    if (!repos || repos.length === 0) {
      return;
    }

    repos.sort((firstRepo, secondRepo) => {
      if (sortBy === 'stars') {
        const starDifference =
          secondRepo.stargazers_count - firstRepo.stargazers_count;
        if (starDifference !== 0) {
          return starDifference;
        }
      }
      return this.dateDifference(secondRepo.updated_at, firstRepo.updated_at);
    });
  }

  private dateDifference(first: string, second: string): number {
    const firstDate = new Date(first);
    const secondDate = new Date(second);
    
    if (isNaN(firstDate.getTime()) || isNaN(secondDate.getTime())) {
      return 0;
    }
    
    return firstDate.getTime() - secondDate.getTime();
  }
}
