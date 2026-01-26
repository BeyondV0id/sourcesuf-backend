import { Request, Response } from 'express';
import { getUserFromLocals } from '@/lib/getUser';
import { prService } from '@/services/tracked-prs.service';
import { issueService } from '@/services/tracked-issues.service';
import { db } from '@/db/client';
import { account } from '@/db/schemas/auth';
import { eq, and } from 'drizzle-orm';
import axios from 'axios';
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const [trackedPrs, trackedIssues] = await Promise.all([
      prService.getAll(userId),
      issueService.getAll(userId),
    ]);
    const githubAccount = await db.query.account.findFirst({
      where: and(eq(account.userId, userId), eq(account.providerId, 'github')),
    });
    let globalStats = {
      username: null as string | null,
      totalPrs: 0,
      mergedPrs: 0,
      totalIssues: 0,
    };
    if (githubAccount?.accessToken) {
      try {
        const headers = {
          Authorization: `Bearer ${githubAccount.accessToken}`,
        };

        // 1. Get User Info
        const { data: user } = await axios.get('https://api.github.com/user', {
          headers,
        });
        globalStats.username = user.login;
        // 2. Search Counts
        const searchUrl = 'https://api.github.com/search/issues';
        const [prRes, mergedRes, issueRes] = await Promise.all([
          axios.get(`${searchUrl}?q=type:pr+author:${user.login}`, { headers }),
          axios.get(`${searchUrl}?q=type:pr+author:${user.login}+is:merged`, {
            headers,
          }),
          axios.get(`${searchUrl}?q=type:issue+author:${user.login}`, {
            headers,
          }),
        ]);
        globalStats.totalPrs = prRes.data.total_count;
        globalStats.mergedPrs = mergedRes.data.total_count;
        globalStats.totalIssues = issueRes.data.total_count;
      } catch (axError) {
        console.error('GitHub API Error:', axError);
      }
    }
    const stats = {
      user: {
        username: globalStats.username,
        totalPrsCreated: globalStats.totalPrs,
        totalPrsMerged: globalStats.mergedPrs,
        totalIssuesCreated: globalStats.totalIssues,
      },
      tracking: {
        activePrs: trackedPrs.filter((p) => p.state === 'open').length,
        activeIssues: trackedIssues.filter((i) => i.state === 'open').length,
        totalTracked: trackedPrs.length + trackedIssues.length,
      },
    };
    const recentPrs = trackedPrs
      .sort(
        (a, b) =>
          new Date(b.last_synced_at).getTime() -
          new Date(a.last_synced_at).getTime()
      )
      .slice(0, 5);
    const recentIssues = trackedIssues
      .sort(
        (a, b) =>
          new Date(b.last_synced_at).getTime() -
          new Date(a.last_synced_at).getTime()
      )
      .slice(0, 5);
    res.json({ stats, recentPrs, recentIssues });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to fetch dashboard' });
  }
};
