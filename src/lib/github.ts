import { Octokit } from "octokit";

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error('GITHUB_ACCESS_TOKEN is missing from environment variables');
}
export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});
