import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listResult, single } from "../utils/response.js";
import {
  getEffectivePermissionsForUser,
  getUserPermissions,
  isSuperAdminRole,
  PERMISSION_CATALOG,
  replaceUserPermissions,
} from "../services/permission.service.js";

export const getPermissionCatalog = (_req, res) => listResult(res, PERMISSION_CATALOG);

export const getMyEffectivePermissions = asyncHandler(async (req, res) => {
  return listResult(res, await getEffectivePermissionsForUser(req.user));
});

export const getPermissionsForUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  return listResult(res, await getEffectivePermissionsForUser(user));
});

export const updatePermissionsForUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (isSuperAdminRole(user.role)) {
    return res.status(400).json({ message: "Super Admin always has full access and does not need assigned permissions." });
  }

  const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions : [];
  return single(res, { permissions: await replaceUserPermissions(user.id, permissions) });
});
