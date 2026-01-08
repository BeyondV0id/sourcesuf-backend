import dotenv from 'dotenv';
import { z } from 'zod';
import { upsertRepo } from '../src/services/repoService';
dotenv.config();
const ycCompanySchema = z.object({
  name: z.string(),
  repo_url: z.string().optional(),
});

const YC_API_URL = 'https://yc-oss.github.io/api/meta.json';

function getRepoNameParts(url: string) {
  try {
    const u = new URL(url);
    const [owner, repo_name] = u.pathname.split('/').filter(Boolean);
    if (!owner || !repo_name) return null;
    return { owner, repo_name };
  } catch (error) {
    return null;
  }
}

async function getRepoData(repoFullName: string) {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'yc-repo-importer',
    },
  });
  if (!res.ok) {
     if (res.status !== 404) console.error(`Failed to fetch ${repoFullName}: ${res.status}`);
     return null;
  }
  return res.json();
}

async function main() {
  console.log('Fetching YC OSS Data...');
  const res = await fetch(YC_API_URL);
  if (!res.ok) throw new Error(`Failed to fetch YC data: ${res.statusText}`);
  
  const rawData = await res.json();
  const companies = z.array(ycCompanySchema).parse(rawData);
  console.log(`Found ${companies.length} companies. Starting sync...`);
  for (const company of companies) {
    if (!company.repo_url) continue;
    const parts = getRepoNameParts(company.repo_url);
    if (!parts) continue;
    const full_name = `${parts.owner}/${parts.repo_name}`;
    const githubData = await getRepoData(full_name);
    if (!githubData) continue;
    try {
      await upsertRepo({
        github_id: githubData.id,
        owner: githubData.owner.login,
        repo_name: githubData.name,
        full_name: githubData.full_name,
        url: githubData.html_url,
        description: githubData.description,
        language: githubData.language,
        stargazers_count: githubData.stargazers_count,
        forks_count: githubData.forks_count,
        watchers_count: githubData.watchers_count,
        open_issues_count: githubData.open_issues_count,
        created_at: githubData.created_at ? new Date(githubData.created_at) : null,
        updated_at: githubData.updated_at ? new Date(githubData.updated_at) : null,
        last_synced_at: new Date(),
        is_yc: true, 
      });
      
      console.log(`Synced: ${full_name}`);
    } catch (err: any) {
      console.error(`Error saving ${full_name}:`, err.message);
    }
  }
}
main()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
