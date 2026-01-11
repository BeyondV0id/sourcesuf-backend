import {Router} from 'express';
import {findIssues} from '../controllers/findIssues';

const router = Router();

router.get('/',findIssues);

export default router;
