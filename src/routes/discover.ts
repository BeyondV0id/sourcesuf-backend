import { Request, Router } from 'express';
import { error } from 'node:console';
import { URLSearchParams } from 'node:url';

const router = Router();

router.get('/', async (req: Request, res) => {
  const language = String(req.query.language ?? '');
  const page = Number(req.query.page ?? 1);

  let query = 'starts:>1';

  if (language) {
    query += `+language:{language}`;
  }

  const params = new URLSearchParams({
    q: query,
    sort: 'forks',
    order: 'desc',
    per_page: '30',
    page: String(page),
  });

  const url = `https://api.github.com/search/repositories?${params.toString()}`;
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Github token is not configured' });
  }
  try {
    const api = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'SourceSurf',
      },
    });

    if (!api.ok) {
      let errorData = {};
      try {
        errorData = await api.json();
      } catch (e) {
        errorData = {};
      }
      return res.status(api.status).json({
        error: 'Github API error',
        status: api.status,
        details: error,
      });
    }

    const data = await api.json();
    res.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate');
    res.json(data);
  } catch (e) {
    console.error('GitHub fetch failed:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
