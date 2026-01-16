import { Request, Response } from 'express';
import { getUserFromLocals } from '@/lib/getUser';
import { issueService } from '@/services/tracked-issues.service';
import { octokit } from '@/lib/github';
import { NewTrackedIssue, updateSystemFields } from '@/services/tracked-issues.service';


const parseIssueUrl = (issueUrl: string) => {
  try {
    const url = new URL(issueUrl);
    const path = url.pathname.split('/').filter(Boolean);

    if (path.length < 4 || path[2] !== 'issues') return null;
    const [owner, repo, type, number] = path;
    return {
      owner,
      repo,
      type,
      number,
    };
  } catch (err) {
    return err;
  }
};
export const getTrackedIssues = async (req: Request, res: Response) => {
  const userId = getUserFromLocals(res.locals).id;
  try {
    const issues = await issueService.getAll(userId);
    res.json(issues);
  } catch (e: any) {
    res.status(500).json({
      e: e.message,
    });
  }
};

export const trackIssue = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { url, notes, priority } = req.body;
    const issueDetails = parseIssueUrl(url);

    if (!issueDetails || issueDetails instanceof Error) {
        res.status(400).json({ error: "Invalid issue URL" });
        return;
    }

    const { data } = await octokit.rest.issues.get({
      owner: issueDetails.owner,
      repo: issueDetails.repo,
      issue_number: Number(issueDetails.number),
    });
    const newIssueData: NewTrackedIssue = {
      user_id: userId,
      repo_owner: issueDetails.owner,
      repo_name: issueDetails.repo,
      number: Number(issueDetails.number),
      html_url: data.html_url,
      title: data.title,
      state: data.state,
      author: data.user ? data.user.login : 'unknown',

      note: notes || '',
      priority: priority || '',
      last_synced_at: new Date(),
    };
    const newIssue = await issueService.create(newIssueData);
    res.json(newIssue);
  } catch (err: any) {
    console.error('Tracked Issue error: ', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteTrackedIssue = async (req:Request,res:Response)=>{
  try{
    const userId = getUserFromLocals(res.locals).id;
    const {id} = req.params;

    await issueService.delete(id,userId);
    res.json({
      success: true,
    })
  }
  catch(err:any){
    res.status(500).json({error:err.message});
  }
};

export const syncIssue = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { id } = req.params;
    const record = await issueService.findById(id, userId);
    if (!record) {
        res.status(404).json({ error: "Issue not found" });
        return; 
    }
    const { data } = await octokit.rest.issues.get({
      owner: record.repo_owner,
      repo: record.repo_name,
      issue_number: record.number
    });
    const updated : updateSystemFields = {
      title: data.title,
      state: data.state,
      last_synced_at: new Date()
    }
    await issueService.updateSystemFields(id,userId,updated);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIssueProxy = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { id } = req.params;
    const { notes, priority } = req.body;
    const updated = await issueService.updateUserField(id, userId, { 
        note: notes, 
        priority, 
    });
    
    if (!updated) {
        res.status(404).json({ error: "Issue not found" });
        return; 
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
