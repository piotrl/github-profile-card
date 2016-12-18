interface IWidgetConfig {
    username?: string;
    template?: string;
    sortBy?: string;
    reposHeaderText?: string;
    maxRepos?: number;
}

interface IUserData {
    profile: IApiProfile;
    repositories: IApiRepository[];
}
