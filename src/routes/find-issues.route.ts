import {Router} from 'express';
import {findIssues} from '../controllers/find-issues.controller';

const router = Router();

router.get('/',findIssues);

export default router;
