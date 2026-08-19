import { listResult } from "../utils/response.js";

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

// GET /permission/me/effective — SUPER_ADMIN bypasses permission checks
// entirely on the frontend (usePermission short-circuits to `true`), so this
// only matters for non-super-admin roles. Returns an empty list by default;
// extend with a real Permission/RolePermission model if you add more roles.
export const getMyEffectivePermissions = (req, res) => {
  if (normalizeRole(req.user?.role) === "SUPER_ADMIN") {
    return listResult(res, [{ resource: "*", action: "*" }]);
  }
  return listResult(res, []);
};
