import { Router } from "express";
import { getLoginStats } from "../controllers/public.controller.js";

const router = Router();

router.get("/login-stats", getLoginStats);

export default router;
