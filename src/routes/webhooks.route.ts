import { Router } from "express";
import { getTrendingRepos } from "@/controllers/webhooks";


const router = Router();

router.post('/incoming',getTrendingRepos);

export default router;


