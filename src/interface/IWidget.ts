import {IApiProfile, IApiRepository} from './IGitHubApi';

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
