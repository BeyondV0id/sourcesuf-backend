import { Octokit } from "@octokit/rest";

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is missing from environment variables');
}
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
