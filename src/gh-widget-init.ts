import { GitHubCardWidget } from './gh-profile-card';

import './css/base.scss';

interface WidgetPublicAPI extends Window {
  GitHubCard: typeof GitHubCardWidget;
}

(window as WidgetPublicAPI).GitHubCard = GitHubCardWidget;

document.addEventListener('DOMContentLoaded', () => {
  const $defaultTemplate = document.querySelector('#github-card');
  if ($defaultTemplate) {
    const widget = new GitHubCardWidget();
    widget.init();
  }
});
