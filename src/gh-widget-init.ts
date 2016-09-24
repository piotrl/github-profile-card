namespace GitHubCard {

    interface WidgetPublicAPI extends Window {
        GitHubCard: GitHubCard;
    }

    (<WidgetPublicAPI> window).GitHubCard = GitHubCard;
}