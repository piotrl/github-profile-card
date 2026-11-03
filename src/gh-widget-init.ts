import { GitHubCardWidget } from './gh-profile-card';

import styles from './css/gh-profile-card.css';

declare global {
  interface Window {
    GitHubCard: typeof GitHubCardWidget;
  }
}

window.GitHubCard = GitHubCardWidget;

const injectStyles = () => {
  const $style = document.createElement('style');
  $style.textContent = styles;
  document.head.appendChild($style);
};

injectStyles();

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
