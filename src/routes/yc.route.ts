import { Router } from 'express';
import { getYcRepos } from '../controllers/yc';

const router = Router();
router.get('/', getYcRepos);

export default router;
