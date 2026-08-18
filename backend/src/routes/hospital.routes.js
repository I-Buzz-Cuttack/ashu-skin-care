import { Router } from "express";
import {
  getHospitals, getHospitalById, createHospital, updateHospital, deleteHospital,
} from "../controllers/hospital.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.post("/", authorize("SUPER_ADMIN"), createHospital);
router.put("/:id", authorize("SUPER_ADMIN"), updateHospital);
router.patch("/:id", authorize("SUPER_ADMIN"), updateHospital);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteHospital);

export default router;
