import { Request, Response } from 'express';
import { octokit } from '../lib/github';
import { z } from 'zod';

const findIssuesSchema = z.object({
  labels: z.string().optional(),
  language: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(30).max(100).optional().default(30),
});

export const findIssues = async (req: Request, res: Response) => {
  try {
    const { labels, language, page, perPage } = findIssuesSchema.parse(
      req.query
    );

    let githubLabels: string[] = [];

    if (labels) {
      const labelQueries = labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `label:"${l}"`);

      githubLabels.push(...labelQueries);
    }
    if (language) {
      githubLabels.push(`language:${language}`);
    }
    const searchQuery = githubLabels.join(' ');

    const { data } = await octokit.search.issuesAndPullRequests({
      q: searchQuery,
      page: page,
      per_page: perPage,
    });
    const issues = data.items.filter((i) => !i.pull_request);
    res.status(200).json({
      page,
      perPage,
      total: data.total_count,
      issues,
    });
  } catch (error) {
    console.error('Error fetching issues from Github: ', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid query parameters',
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
