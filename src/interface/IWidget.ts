import { ApiProfile, ApiRepository } from './IGitHubApi';

export interface WidgetConfig {
  username?: string;
  template?: string;
  sortBy?: string;
  headerText?: string;
  maxRepos?: number;
  hideTopLanguages?: boolean;
}

export interface ApiUserData {
  profile: ApiProfile;
  repositories: ApiRepository[];
}
