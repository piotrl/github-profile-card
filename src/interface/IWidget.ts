import {IApiProfile, IApiRepository} from "./IGitHubApi";

export interface IWidgetConfig {
    username?: string;
    template?: string;
    sortBy?: string;
    headerText?: string;
    maxRepos?: number;
}

export interface IUserData {
    profile: IApiProfile;
    repositories: IApiRepository[];
}
