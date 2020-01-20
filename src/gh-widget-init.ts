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
    const widget = new GitHubCardWidget();
    widget.init();
  }
});
