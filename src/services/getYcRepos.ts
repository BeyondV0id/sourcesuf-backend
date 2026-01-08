import {db} from '../db/client';
import {repos} from '../db/schemas/repos';
import {eq,desc} from 'drizzle-orm';


export const YcRepoService = async(limit:number,offset:number) =>{
  return await db
    .select()
    .from(repos)
    .where(eq(repos.is_yc,true))
    .orderBy(desc(repos.stargazers_count))
    .limit(limit)
    .offset(offset);
}
