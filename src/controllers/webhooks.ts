import {} from '../services/tags';
import { octokit } from '../lib/github';

import { WebHookPayload } from '@/types/types';
import { process } from 'zod/v4/core';

export const getTrendingRepos = async (req: Requset, res: Response) => {
  const { repos, category } = req.body as WebHookPayload;
  const secretHeaders = req.get('x-admin-secret');
  if (!secretHeaders || secretHeaders !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if(!repos || repos.length === 0){
    return  res.status(200).json({message:'No repos to process'});
  }
};
