import { Router } from "express";
import {
  getMyEffectivePermissions,
  getPermissionCatalog,
  getPermissionsForUser,
  updatePermissionsForUser,
} from "../controllers/permission.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/catalog", getPermissionCatalog);
router.get("/me/effective", getMyEffectivePermissions);
router.get("/user/:userId", authorize("SUPER_ADMIN"), getPermissionsForUser);
router.put("/user/:userId", authorize("SUPER_ADMIN"), updatePermissionsForUser);

export default router;
