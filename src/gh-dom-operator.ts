import { ApiError, ApiProfile, ApiRepository } from './interface/IGitHubApi';
import {
  createAvatar,
  createFollowButton,
  createFollowContainer,
  createFollowers,
  createName,
  createProfile,
} from './gh-dom.utils';

export class DOMOperator {
  public static clearChildren($parent: HTMLElement): void {
    // More efficient way to clear children
    $parent.textContent = '';
  }

  public static createError(error: ApiError, username: string): HTMLDivElement {
    const $error = document.createElement('div');
    $error.className = 'error';
    
    const $message = document.createElement('span');
    $message.textContent = error.message;
    $error.appendChild($message);

    if (error.isWrongUser) {
      $message.textContent = `Not found user: ${username}`;
    }
    
    if (error.resetDate) {
      const currentTime = new Date().getTime();
      const resetTime = error.resetDate.getTime();
      const remainingMinutes = Math.ceil((resetTime - currentTime) / (1000 * 60));
      
      const $remainingTime = document.createElement('span');
      $remainingTime.className = 'remain';
      $remainingTime.textContent = `Come back after ${remainingMinutes} minutes`;
      $error.appendChild($remainingTime);
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
    const sortedLanguages = Object.keys(langs)
      .map((language) => ({
        name: language,
        stat: langs[language],
      }))
      .sort((a, b) => b.stat - a.stat)
      .slice(0, 3);

    return sortedLanguages
      .map((lang) => {
        // Escape HTML to prevent XSS
        const escapedName = this.escapeHtml(lang.name);
        return `<li>${escapedName}</li>`;
      })
      .join('');
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public static createRepositoriesHeader(headerText: string): HTMLSpanElement {
    const $repositoriesHeader = document.createElement('span');
    $repositoriesHeader.className = 'header';
    $repositoriesHeader.appendChild(document.createTextNode(`${headerText}`));

    return $repositoriesHeader;
  }

  public static createRepositoriesList(
    repositories: ApiRepository[],
    maxRepos: number,
  ): HTMLDivElement {
    const $reposList = document.createElement('div');
    $reposList.className = 'repos';

    repositories
      .slice(0, maxRepos)
      .map(this.createRepositoryElement)
      .forEach((el) => $reposList.appendChild(el));

    return $reposList;
  }

  private static createRepositoryElement(
    repository: ApiRepository,
  ): HTMLAnchorElement {
    const updated = new Date(repository.updated_at);
    const $repoLink = document.createElement('a');

    $repoLink.href = repository.html_url;
    $repoLink.title = repository.description || '';

    // Create elements safely to prevent XSS
    const $repoName = document.createElement('span');
    $repoName.className = 'repo-name';
    $repoName.textContent = repository.name;

    const $updated = document.createElement('span');
    $updated.className = 'updated';
    $updated.textContent = `Updated: ${updated.toLocaleDateString()}`;

    const $star = document.createElement('span');
    $star.className = 'star';
    $star.textContent = String(repository.stargazers_count);

    $repoLink.appendChild($repoName);
    $repoLink.appendChild($updated);
    $repoLink.appendChild($star);

    return $repoLink;
  }
}
