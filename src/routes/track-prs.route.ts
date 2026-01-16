import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getTrackedPRs,
  trackPR,
  deleteTrackedPr,
  syncPR,
  updatePRProxy,
} from '../controllers/track-prs.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getTrackedPRs);
router.post('/', trackPR);
router.delete('/:id', deleteTrackedPr);
router.post('/:id/sync', syncPR);
router.patch('/:id', updatePRProxy);

export default router;
