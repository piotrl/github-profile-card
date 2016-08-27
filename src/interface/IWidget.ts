/**
 * Widget interfaces
 */

interface IWidgetConfig {
    username?: string;
    template: string;
    sortBy: string;
    reposHeaderText: string;
    maxRepos: number;
    githubIcon: boolean;
}

interface IUserData {
    profile: IApiProfile;
    repositories: IApiRepository[];
    languagesUrls: string[];
}

interface IApiCallback<T> {
    (data: T, error: IApiError): void
}

interface IApiError {
    message: string;
    isWrongUser?: boolean;
    resetDate?: Date;
}