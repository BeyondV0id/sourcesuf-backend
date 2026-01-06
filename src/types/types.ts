export interface ScrapedRepo {
  owner: string;
  repo: string;
}


export interface WebHookPayload{
  repos: ScrapedRepo[];
  category: string;
}
