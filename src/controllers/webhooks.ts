import { linkTopicsToRepo } from '../services/tags';
import { Request, Response } from 'express';
import { octokit } from '../lib/github';
import { WebHookPayload } from '@/types/types';
import { RepoSchema } from '@/types/schema';
import { upsertRepo } from '@/services/repoService';
import { clearOldTrending, updateTrendingRepos } from '@/services/trendingRepos';

export const getTrendingRepos = async (req: Request, res: Response) => {
  const { repoList, category } = req.body as WebHookPayload;

  const secretHeaders = req.get('x-admin-secret');
  if (!secretHeaders || secretHeaders !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!repoList || repoList.length === 0) {
    return res.status(200).json({ message: 'No repos to process' });
  }

  //clear old trending
  await clearOldTrending(category);

  for (const item of repoList) {
    try {
      const { data: full } = await octokit.rest.repos.get({
        owner: item.owner,
        repo: item.repo,
      });

      const rawData = {
        github_id: full.id,
        owner: full.owner.login,
        repo_name: full.name,
        full_name: full.full_name,
        url: full.html_url,
        description: full.description ?? null,
        language: full.language ?? null,
        stargazers_count: full.stargazers_count,
        forks_count: full.forks_count,
        watchers_count: full.watchers_count,
        open_issues_count: full.open_issues_count,
        is_yc: false,
        created_at: full.created_at,
        updated_at: full.updated_at,
        last_synced_at: new Date(),
      };

      const validatedData = RepoSchema.parse(rawData);
      const repoId = await upsertRepo(validatedData);

      await linkTopicsToRepo(repoId, full.topics || []);

      //link trending category(period)

      await updateTrendingRepos(repoId,category);

    } catch (err) {
      console.error(`Failed to sync ${item.owner}/${item.repo}:`, err.message);
    }
  }

  return res.json({ success: true });
};
