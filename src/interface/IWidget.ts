/**
 * Widget interfaces
 */

namespace GitHubCard {

    export interface IWidgetConfig {
        username?: string;
        template?: string;
        sortBy: string;
        reposHeaderText: string;
        maxRepos: number;
        githubIcon: boolean;
    }

    export interface IUserData {
        profile: IApiProfile;
        repositories: IApiRepository[];
    }
}