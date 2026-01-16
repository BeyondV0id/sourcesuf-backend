import { Router } from "express";
import { getTrendingRepos } from "@/controllers/webhooks.controller";


const router = Router();

router.post('/incoming',getTrendingRepos);

export default router;


