interface IApiUrls {
    api: string;
    langs: string[];
}

interface IApiError {
    message: string;
    isWrongUser?: boolean;
    resetDate?: Date;
}

interface IWidgetConfig {
    template: string;
    sortBy: string;
    reposHeaderText: string;
    maxRepos: number;
    githubIcon: boolean;
}

interface IApiProfile {
    name: string;
    avatar_url: string;
    followers: number;
    followers_url: string;
    html_url: string;
    login: string;
}
