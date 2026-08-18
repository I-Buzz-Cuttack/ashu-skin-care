import { Router } from "express";
import {
  getDesignations, createDesignation, updateDesignation, deleteDesignation,
} from "../controllers/designation.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getDesignations);
router.post("/", authorize("SUPER_ADMIN"), createDesignation);
router.put("/:id", authorize("SUPER_ADMIN"), updateDesignation);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteDesignation);

export default router;
