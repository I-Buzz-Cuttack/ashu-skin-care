import { Router } from "express";
import {
  getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment,
} from "../controllers/department.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", authorize("SUPER_ADMIN"), createDepartment);
router.put("/:id", authorize("SUPER_ADMIN"), updateDepartment);
router.patch("/:id", authorize("SUPER_ADMIN"), updateDepartment);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteDepartment);

export default router;
