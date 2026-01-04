import dotenv from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/client';
import { repos } from '../src/db/schemas/repos';

dotenv.config();

const filePath = path.join(process.cwd(), 'scripts/data/yc.json');

/* ---------------- ZOD SCHEMA (MATCHES DB TYPES) ---------------- */

const repoSchema = z.object({
  full_name: z.string(),
  owner: z.string(),
  repo_name: z.string(),
  github_id: z.number(),
  url: z.string().url(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  watchers_count: z.number(),
  open_issues_count: z.number(),
  is_yc: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

/* ---------------- HELPERS ---------------- */

function getRepoNameParts(url: string) {
  const u = new URL(url);
  const [owner, repo_name] = u.pathname.split('/').filter(Boolean);
  if (!owner || !repo_name) {
    throw new Error('Invalid GitHub repo URL');
  }
  return { owner, repo_name };
}

async function getRepoData(repoFullName: string) {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch ${repoFullName}: ${res.status}`);
    return null;
  }

  return res.json();
}

/* ---------------- MAIN SCRIPT ---------------- */

async function main() {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data: Record<string, any> = JSON.parse(rawData);

  for (const [key, repoInfo] of Object.entries(data)) {
    if (!repoInfo || typeof repoInfo.url !== 'string') {
      console.warn(`Skipping ${key}: invalid or missing url`);
      continue;
    }

    let owner: string, repo_name: string;
    try {
      ({ owner, repo_name } = getRepoNameParts(repoInfo.url));
    } catch (err) {
      console.warn(`Skipping ${key}: bad url`, err);
      continue;
    }

    const full_name = `${owner}/${repo_name}`;
    const githubData = await getRepoData(full_name);

    if (!githubData) {
      console.warn(`Skipping ${key}: GitHub fetch failed`);
      continue;
    }

    const repoObject = {
      full_name,
      owner,
      repo_name,
      github_id: githubData.id,
      url: githubData.html_url,
      description: githubData.description,
      stargazers_count: githubData.stargazers_count,
      forks_count: githubData.forks_count,
      watchers_count: githubData.watchers_count,
      open_issues_count: githubData.open_issues_count,
      created_at: githubData.created_at
        ? new Date(githubData.created_at)
        : null,
      updated_at: githubData.updated_at
        ? new Date(githubData.updated_at)
        : null,
      is_yc: true,
    };

    const parsed = repoSchema.safeParse(repoObject);
    if (!parsed.success) {
      console.error(`Validation failed for ${full_name}`, parsed.error);
      continue;
    }

    await db.insert(repos).values(parsed.data).onConflictDoUpdate({
      target: repos.github_id,
      set: parsed.data,
    });

    console.log(`Inserted / Updated ${full_name}`);
  }
}

/* ---------------- RUN ---------------- */

main()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed', err);
    process.exit(1);
  });
