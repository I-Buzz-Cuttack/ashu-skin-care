import { Router } from "express";
import {
  getOpdAppointments, getOpdAppointmentById, createOpdAppointment,
  updateOpdAppointment, deleteOpdAppointment,
} from "../controllers/opdAppointment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", getOpdAppointments);
router.get("/:id", getOpdAppointmentById);
router.post("/", createOpdAppointment);
router.put("/:id", updateOpdAppointment);
router.delete("/:id", deleteOpdAppointment);

export default router;
