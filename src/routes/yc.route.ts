import { Router } from 'express';
import { getYcRepos } from '../controllers/findYC';

const router = Router();
router.get('/', getYcRepos);

export default router;
