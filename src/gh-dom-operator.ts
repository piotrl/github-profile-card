import { ApiError, ApiProfile, ApiRepository } from './interface/IGitHubApi';
import {
  createAvatar,
  createFollowButton,
  createFollowContainer,
  createFollowers,
  createName,
  createProfile
} from './gh-dom.utils';

export class DOMOperator {
  public static clearChildren($parent: HTMLElement): void {
    while ($parent.hasChildNodes()) {
      $parent.removeChild($parent.firstChild);
    }
  }

  public static createError(error: ApiError, username: string): HTMLDivElement {
    const $error = document.createElement('div');
    $error.className = 'error';
    $error.innerHTML = `<span>${error.message}</span>`;

    if (error.isWrongUser) {
      $error.innerHTML = `<span>Not found user: ${username}</span>`;
    }
    if (error.resetDate) {
      let remainingTime =
        error.resetDate.getMinutes() - new Date().getMinutes();
      remainingTime = remainingTime < 0 ? 60 + remainingTime : remainingTime;

      $error.innerHTML += `<span class="remain">Come back after ${remainingTime} minutes</span>`;
    }

    return $error;
  }

  public static createProfile(data: ApiProfile): HTMLDivElement {
    const $followButton = createFollowButton(data.login, data.html_url);
    const $followers = createFollowers(data.followers);
    const $followContainer = createFollowContainer([$followButton, $followers]);

    const $avatar = createAvatar(data.avatar_url);
    const $name = createName(data.html_url, data.name);

    return createProfile([$avatar, $name, $followContainer]);
  }

  public static createTopLanguagesSection(): HTMLUListElement {
    const $langsList = document.createElement('ul');
    $langsList.className = 'languages';

    return $langsList;
  }

  public static createTopLanguagesList(langs: Record<string, number>): string {
    return Object.keys(langs)
      .map(language => ({
        name: language,
        stat: langs[language]
      }))
      .sort((a, b) => b.stat - a.stat)
      .slice(0, 3)
      .map(lang => `<li>${lang.name}</li>`)
      .reduce((list, nextElement) => list + nextElement);
  }

  public static createRepositoriesHeader(headerText): HTMLSpanElement {
    const $repositoriesHeader = document.createElement('span');
    $repositoriesHeader.className = 'header';
    $repositoriesHeader.appendChild(document.createTextNode(`${headerText}`));

    return $repositoriesHeader;
  }

  public static createRepositoriesList(
    repositories: ApiRepository[],
    maxRepos: number
  ): HTMLDivElement {
    const $reposList = document.createElement('div');
    $reposList.className = 'repos';

    repositories
      .slice(0, maxRepos)
      .map(this.createRepositoryElement)
      .forEach(el => $reposList.appendChild(el));

    return $reposList;
  }

  private static createRepositoryElement(
    repository: ApiRepository
  ): HTMLAnchorElement {
    const updated = new Date(repository.updated_at);
    const $repoLink = document.createElement('a');

    $repoLink.href = repository.html_url;
    $repoLink.title = repository.description;
    $repoLink.innerHTML = `
                <span class="repo-name"> ${repository.name} </span>
                <span class="updated">Updated: ${updated.toLocaleDateString()} </span>
                <span class="star"> ${repository.stargazers_count} </span>
            `;
    return $repoLink;
  }
}
