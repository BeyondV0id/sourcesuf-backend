import { Router } from 'express';
import { trackPRs } from '../controllers/trackPRs';

const router = Router();

router.get('/', trackPRs);

export default router;
