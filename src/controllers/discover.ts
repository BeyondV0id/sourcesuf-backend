import { Request, Response } from 'express';
import { octokit } from '../lib/github';

export const getDiscoverRepos = async (req: Request, res: Response) => {
  const language = req.query.language ? String(req.query.language) : undefined;
  const page = Number(req.query.page) || 1;

  let q = 'stars:>1';
  if (language) {
    q += ` language:${language}`;
  }

  try {
    const { data } = await octokit.rest.search.repos({
      q,
      sort: 'forks',
      order: 'desc',
      per_page: 30,
      page,
    });
    res.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate');
    res.json(data);
  } catch (error: any) {
    console.error('GitHub API Error:', error.message);
    const status = error.status || 500;
    res.status(status).json({
      error: 'Github API error',
      status,
      details: error.message,
    });
  }
};
