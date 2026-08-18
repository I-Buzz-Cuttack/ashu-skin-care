import { Router } from "express";
import {
  getPathologyMaster, createPathologyMaster, updatePathologyMaster, deletePathologyMaster,
} from "../controllers/pathologyMaster.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getPathologyMaster);
router.post("/", authorize("SUPER_ADMIN"), createPathologyMaster);
router.put("/:id", authorize("SUPER_ADMIN"), updatePathologyMaster);
router.delete("/:id", authorize("SUPER_ADMIN"), deletePathologyMaster);

export default router;
