import { Router } from 'express';
import { getDiscoverRepos } from '../controllers/discover';

const router = Router();

router.get('/', getDiscoverRepos);

export default router;
