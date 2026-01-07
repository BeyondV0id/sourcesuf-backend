import { db } from '@/db/client';
import { trending_repos } from '@/db/schemas/trending';
import {eq} from 'drizzle-orm';


export const updateTrendingRepos = async (repo_id: number, period: string) => {
  const result = await db
    .insert(trending_repos)
    .values({
      repo_id: repo_id,
      period: period,
      created_at: new Date(),
    })
    .onConflictDoNothing()
    .returning({ id: trending_repos.id });

  return result[0]?.id;
};

export const clearOldTrending = async (category:string)=>{
  const period = category;
  await db.delete(trending_repos).where(eq(trending_repos.period,period));
};
