import { Router } from 'express';
import { getTrendingList } from '../controllers/findTrending';

const router = Router();

router.get('/', getTrendingList);

export default router;
