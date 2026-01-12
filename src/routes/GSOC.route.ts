import { Router } from 'express';
import { findGSOC } from '@/controllers/findGSOC';

const router = Router();

router.get('/', findGSOC);

export default router;
