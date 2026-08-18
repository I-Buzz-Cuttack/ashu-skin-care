import { Router } from "express";
import {
  getPrescriptions, getPrescriptionById, createPrescription,
  updatePrescription, deletePrescription,
} from "../controllers/prescription.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", getPrescriptions);
router.get("/:id", getPrescriptionById);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);
router.delete("/:id", deletePrescription);

export default router;
