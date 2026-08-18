import { Router } from "express";
import {
  getOpdCategories, createOpdCategory, updateOpdCategory, deleteOpdCategory,
} from "../controllers/opdCategory.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getOpdCategories);
router.post("/", authorize("SUPER_ADMIN"), createOpdCategory);
router.put("/:id", authorize("SUPER_ADMIN"), updateOpdCategory);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteOpdCategory);

export default router;
