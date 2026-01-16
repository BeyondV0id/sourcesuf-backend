import { Router } from 'express';
import { getDiscoverRepos } from '../controllers/discover.controller';

const router = Router();

router.get('/', getDiscoverRepos);

export default router;
