interface WidgetPublicAPI extends Window {
    GitHubCard: typeof GitHubCardWidget;
}

(<WidgetPublicAPI> window).GitHubCard = GitHubCardWidget;

document.addEventListener('DOMContentLoaded', () => {
    const widget = new GitHubCardWidget();
    widget.init();
});