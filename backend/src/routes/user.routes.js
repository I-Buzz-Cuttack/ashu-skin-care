import { Router } from "express";
import {
  getUsers, getUserById, createUser, updateUser, deleteUser,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", authorize("SUPER_ADMIN"), createUser);
router.put("/:id", authorize("SUPER_ADMIN"), updateUser);
router.patch("/:id", authorize("SUPER_ADMIN"), updateUser);
router.delete("/:id", authorize("SUPER_ADMIN"), deleteUser);

export default router;
