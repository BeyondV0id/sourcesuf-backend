import { Request, Response } from 'express';
import { getUserFromLocals } from '@/lib/getUser';
import { prService } from '@/services/tracked-prs.service';
import { octokit } from '@/lib/github';
import {
  TrackedPRInsert,
  UpdateSystemFields,
} from '@/services/tracked-prs.service';

const parsePrUrl = (prUrl: string) => {
  try {
    const url = new URL(prUrl);
    const path = url.pathname.split('/').filter(Boolean);

    if (path.length < 4 || path[2] !== 'pull') return null;
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
export const getTrackedPRs = async (req: Request, res: Response) => {
  const userId = getUserFromLocals(res.locals).id;
  try {
    const prs = await prService.getAll(userId);
    res.json(prs);
  } catch (e: any) {
    res.status(500).json({
      e: e.message,
    });
  }
};

export const trackPR = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { url, notes, priority } = req.body;
    const prDetails = parsePrUrl(url);

    const { data } = await octokit.rest.pulls.get({
      owner: prDetails.owner,
      repo: prDetails.repo,
      pull_number: prDetails.number,
    });
    const newPrData: TrackedPRInsert = {
      user_id: userId,
      repo_owner: prDetails.owner,
      repo_name: prDetails.repo,
      number: prDetails.number,
      html_url: data.html_url,
      title: data.title,
      state: data.merged ? 'merged' : data.state,
      author: data.user.login,

      additions: data.additions,
      deletions: data.deletions,
      changed_files: data.changed_files,

      merged_at: data.merged_at ? new Date(data.merged_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      opened_at: new Date(data.created_at),
      merged_by: data.merged_by?.login || null,

      note: notes || '',
      priority: priority || '',
      last_synced_at: new Date(),
    };
    const newPr = await prService.create(newPrData);
    res.json(newPr);
  } catch (err: any) {
    console.error('Tracked Pr error: ', err);
    res.status(500).json({ error: err.messsage });
  }
};

export const deleteTrackedPr = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    await prService.delete(parsedId, userId);
    res.json({
      success: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const syncPR = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { id } = req.params;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const record = await prService.findById(parsedId, userId);
    if (!record) {
      res.status(404).json({ error: 'PR not found' });
      return;
    }
    const { data } = await octokit.rest.pulls.get({
      owner: record.repo_owner,
      repo: record.repo_name,
      pull_number: record.number,
    });
    const updated: UpdateSystemFields = {
      title: data.title,
      state: data.merged ? 'merged' : data.state,
      additions: data.additions,
      deletions: data.deletions,
      changed_files: data.changed_files,
      merged_at: data.merged_at ? new Date(data.merged_at) : null,
      closed_at: data.closed_at ? new Date(data.closed_at) : null,
      opened_at: new Date(data.created_at),
      merged_by: data.merged_by?.login || null,
      last_synced_at: new Date(),
    };
    await prService.updateSystemFields(parsedId, userId, updated);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePRProxy = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromLocals(res.locals).id;
    const { id } = req.params;
    const { notes, priority } = req.body;

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const updated = await prService.updateUserField(parsedId, userId, {
      note: notes,
      priority,
    });

    if (!updated) {
      res.status(404).json({ error: 'PR not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
