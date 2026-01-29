import { Request, Response } from "express";
import { getUserFromLocals } from "../lib/getUser";
import { db } from "../db/client";
import { octokit } from "../lib/github";
import { eq, and } from "drizzle-orm";
import { account } from "@/db/schemas/auth";
import { Octokit } from "@octokit/rest";
import { userRelations } from "../../drizzle/relations";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;

    const githubAccount = await db.query.account.findFirst({
      where: and(eq(account.userId, userId), eq(account.providerId, "github")),
    });

    if (!githubAccount?.accessToken) {
      res.status(401).json({ error: "Github account not connected" });
      return;
    }

    const userOctokit = new Octokit({
      auth: githubAccount.accessToken,
    });

    const { data: user } = await userOctokit.rest.users.getAuthenticated();

    const profileData = {
      username: user.login,
      user: {
        name: user.name,
        login: user.login,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        createdAt: user.created_at,
        htmlUrl: user.html_url,
      },
    };

    const [
      reposRes,
      commitsRes,
      prsRes,
      mergedPrsRes,
      openPrsRes,
      issuesRes,
      reviewsRes,
    ] = await Promise.all([
      octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        type: "owner",
      }),

      octokit.rest.search.commits({
        q: `author:${profileData.username}`,
        headers: { Accept: "application/vnd.github.cloak-preview" },
      }),

      octokit.rest.search.issuesAndPullRequests({
        q: `author:${profileData.username} type:pr`,
      }),

      octokit.rest.search.issuesAndPullRequests({
        q: `author:${profileData.username} type:pr is:merged`,
      }),

      octokit.rest.search.issuesAndPullRequests({
        q: `author:${profileData.username} type:pr is:open`,
      }),

      octokit.rest.search.issuesAndPullRequests({
        q: `author:${profileData.username} type:issue`,
      }),

      octokit.rest.search.issuesAndPullRequests({
        q: `reviewed-by:${profileData.username} type:pr`,
      }),
    ]);

    const languagesMap: Record<string,number> = {};
    reposRes.data.forEach((repo)=>{
        if(repo.language){
            languagesMap[repo.language] = (languagesMap[repo.labels_url] || 0) + 1;
        }
    });
    const totalPrs = prsRes.data.total_count;
    const mergedPrs = mergedPrsRes.data.total_count;
    const openPrs = openPrsRes.data.total_count;
    const closedPrs = Math.max(0, totalPrs - mergedPrs - openPrs);
    const totalCommits = commitsRes.data.total_count;
    const totalIssues = issuesRes.data.total_count;
    const totalReviews = reviewsRes.data.total_count;

    const topLanguagues = Object.entries(languagesMap)
        .sort((a,b) => b[1] - a[1])
        .slice(0,5)
        .map(([langName,value]) => ({
            langName,
            value,
        }));
    
        const repsonseData = {
            ...profileData,
            stats:{
                totalCommits: totalCommits,
                totalPrs: totalPrs,
                totalIssues: totalIssues,
                totalReviews: totalReviews,
            },
           graphs: {
            languages: topLanguagues,
            radar:{
                commits: totalCommits,
                prs: totalPrs,
                issues: totalIssues,
                reviews: totalReviews,
            },
            prStats:{
                merged:mergedPrs,
                open:openPrs,
                closed:closedPrs,
            }
           } 

       };
       res.json(repsonseData);

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Failed to fetch profile" });
  }

};
