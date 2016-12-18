interface IWidgetConfig {
    username?: string;
    template?: string;
    sortBy?: string;
    headerText?: string;
    maxRepos?: number;
}

interface IUserData {
    profile: IApiProfile;
    repositories: IApiRepository[];
}
