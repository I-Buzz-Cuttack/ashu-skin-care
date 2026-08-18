import { Router } from "express";
import {
  getOpdCharges, createOpdCharge, updateOpdCharge, deleteOpdCharge,
} from "../controllers/opdCharge.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getOpdCharges);
router.post("/", authorize("SUPER_ADMIN"), createOpdCharge);
router.put("/:id", authorize("SUPER_ADMIN"), updateOpdCharge);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteOpdCharge);

export default router;
