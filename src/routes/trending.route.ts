import { Router } from 'express';
import { getTrendingList } from '../controllers/trending';

const router = Router();

router.get('/', getTrendingList);

export default router;
