import { requireAuth } from "@/middleware/auth.middleware";
import {Router} from "express";

const router = Router();

router.use(requireAuth);

router.get('/',getDashboard);

