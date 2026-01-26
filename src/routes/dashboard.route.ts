import { requireAuth } from "@/middleware/auth.middleware";
import {Router} from "express";
import { getDashboard } from "../controllers/dashboard.controller";

const router = Router();

router.use(requireAuth);



router.get('/',getDashboard);

export default router;



