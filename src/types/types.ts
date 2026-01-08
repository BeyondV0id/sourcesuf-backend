export interface ScrapedRepo {
  owner: string;
  repo: string;
  stars_earned: number;
}

export interface WebHookPayload {
  repoList: ScrapedRepo[];
  category: string;
}
