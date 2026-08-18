import { Router } from "express";
import { getMyEffectivePermissions } from "../controllers/permission.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/me/effective", getMyEffectivePermissions);

export default router;
