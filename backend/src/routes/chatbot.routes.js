import { Router } from "express";
import { chat } from "../controllers/chatbot.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/chat", chat);

export default router;
