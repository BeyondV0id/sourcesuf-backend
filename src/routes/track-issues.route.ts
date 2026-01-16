import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getTrackedIssues,
  trackIssue,
  deleteTrackedIssue,
  syncIssue,
  updateIssueProxy,
} from '../controllers/track-issues.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getTrackedIssues);
router.post('/', trackIssue);
router.delete('/:id', deleteTrackedIssue);
router.post('/:id/sync', syncIssue);
router.patch('/:id', updateIssueProxy);

export default router;
