interface IWidgetConfig {
    username?: string;
    template?: string;
    sortBy: string;
    reposHeaderText: string;
    maxRepos: number;
    githubIcon: boolean;
}

interface IUserData {
    profile: IApiProfile;
    repositories: IApiRepository[];
}
