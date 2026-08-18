import { listResult } from "../utils/response.js";

// GET /permission/me/effective — SUPER_ADMIN bypasses permission checks
// entirely on the frontend (usePermission short-circuits to `true`), so this
// only matters for non-super-admin roles. Returns an empty list by default;
// extend with a real Permission/RolePermission model if you add more roles.
export const getMyEffectivePermissions = (req, res) => listResult(res, []);
