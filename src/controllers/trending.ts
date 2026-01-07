import { Request, Response } from 'express';
import { db } from '../db/client';
export const getTrendingList = async (req: Request, res: Response) => {

  const period = (req.query.period as string) || 'daily';
  try {
    const results = await db.query.trending_repos.findMany({
      where: (t, { eq }) => eq(t.period, period),
      with: {
        repo: {
          with: {
            tags: {
              with: {
                tag: true 
              }
            }
          }
        }
      }
    });


    const cleanData = results.map((row) => {
      if (!row.repo) return null;
      return {
        ...row.repo,
        tags: row.repo.tags.map((rt) => rt.tag.name) 
      };
    }).filter(Boolean); 
    return res.json({ data: cleanData });
  } catch (err) {
    console.error('Fetch trending error:', err);
    return res.status(500).json({ error: 'Failed to fetch trending repos' });
  }
};
