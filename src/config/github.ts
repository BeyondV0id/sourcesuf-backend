import dotenv from 'dotenv';
dotenv.config();

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn("GITHUB_TOKEN is not defined in .env. API rate limits will be restricted.");
}

export const GITHUB_API_BASE_URL = "https://api.github.com";
