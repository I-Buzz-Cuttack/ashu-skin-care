import { Router } from "express";
import {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient,
} from "../controllers/patient.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
