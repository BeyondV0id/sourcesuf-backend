import dotenv from "dotenv";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { db } from "../src/db/client";
import { yc_repos } from "../src/db/schemas/yc";

const filePath = path.join(process.cwd(), "scripts/data/yc.json");
dotenv.config();

//zod schema

const ycRepoSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  description: z.string(),
  star_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issue_count: z.number(),
});

type ycRepo = z.infer<typeof ycRepoSchema>;

const rawData = fs.readFileSync(filePath, "utf-8");
const data: Record<string, any> = JSON.parse(rawData);

function getRepoName(url: string) {
  const u = new URL(url);
  const [owner, repo] = u.pathname.split("/").filter(Boolean);
  return `${owner}/${repo}`;
}

async function getRepoDescription(repoName: string) {
  const res = await fetch(`https://api.github.com/repos/${repoName}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) {
    console.error(`Failed to fetch ${repoName}`);
    return "";
  }
  const repoData = await res.json();
  return repoData.description ?? "";
}

async function main() {
  for (const [key, repoInfo] of Object.entries(data)) {
    if (
      !repoInfo ||
      typeof repoInfo.url !== "string" ||
      repoInfo.url.trim().length === 0
    ) {
      console.warn(`Skipping ${key}: missing or invalid url`);
      continue;
    }
    let repoName: string;
    try {
      repoName = getRepoName(repoInfo.url);
    } catch (e) {
      console.warn(`Skipping ${key}: failed to parse url '${repoInfo.url}'`, e);
      continue;
    }
    let description = "";
    try {
      description = await getRepoDescription(repoName);
    } catch (e) {
      console.warn(
        `Skipping ${key}: failed to fetch description for ${repoName}`,
        e
      );
      continue;
    }
    const repoObject = {
      name: key,
      url: repoInfo.url,
      description,
      star_count: Number(repoInfo.github_repo.stargazers_count) || 0,
      watchers_count: Number(repoInfo.github_repo.watchers_count) || 0,
      forks_count: Number(repoInfo.github_repo.forks_count) || 0,
      open_issue_count: Number(repoInfo.github_repo.open_issues_count) || 0,
    };

    const result = ycRepoSchema.safeParse(repoObject);
    if (!result.success) {
      console.error(`Validation failed for ${key}:`, result.error);
      continue;
    }
    const validRepo: ycRepo = result.data;
    await db.insert(yc_repos).values(validRepo);
  }
}

main()
  .then(() => {
    console.log("Import completed");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Imports failed", e);
    process.exit(1);
  });
