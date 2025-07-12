import { GitHubCardWidget } from './gh-profile-card';

import './css/base.scss';

declare global {
  interface Window {
    GitHubCard: typeof GitHubCardWidget;
  }
}

window.GitHubCard = GitHubCardWidget;

document.addEventListener('DOMContentLoaded', () => {
  const $defaultTemplate = document.querySelector('#github-card');
  if ($defaultTemplate) {
    try {
      const widget = new GitHubCardWidget();
      widget.init().catch((error) => {
        console.error('Failed to initialize GitHub Card widget:', error);
      });
    } catch (error) {
      console.error('Failed to construct GitHub Card widget:', error);
    }
  }
});
