export interface ScrapedRepo {
  owner: string;
  repo: string;
}


export interface WebHookPayload{
  repoList: ScrapedRepo[];
  category: string;
}
