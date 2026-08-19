import prisma from "../config/db.js";

export const PERMISSION_CATALOG = [
  { resource: "dashboard", label: "Dashboard", actions: ["read"] },
  { resource: "opd", label: "OPD Console", actions: ["read", "create", "update", "delete"] },
  { resource: "prescription", label: "E-Prescription", actions: ["read", "create", "update", "print"] },
  { resource: "patient", label: "Patient Directory", actions: ["read", "create", "update", "delete"] },
  { resource: "patient_scanner", label: "Patient Scanner", actions: ["read"] },
  { resource: "doctor", label: "Doctor Master", actions: ["read", "create", "update", "delete"] },
  { resource: "ipd", label: "IPD", actions: ["read", "create", "update", "delete"] },
  { resource: "billing", label: "Billing", actions: ["read", "create", "update", "export"] },
  { resource: "user", label: "Members", actions: ["read", "create", "update", "delete"] },
  { resource: "permission", label: "Permissions", actions: ["read", "update"] },
];

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const normalizePermission = (permission) => ({
  resource: String(permission?.resource || "").trim().toLowerCase(),
  action: String(permission?.action || "").trim().toLowerCase(),
});

export const isSuperAdminRole = (role) => normalizeRole(role) === "SUPER_ADMIN";

export const ensurePermissionTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_permissions (
      id INT NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(191) NOT NULL,
      resource VARCHAR(100) NOT NULL,
      action VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY user_resource_action_unique (user_id, resource, action),
      INDEX user_permissions_user_id_idx (user_id)
    )
  `);
};

export const getUserPermissions = async (userId) => {
  if (!userId) return [];
  await ensurePermissionTable();
  const rows = await prisma.$queryRawUnsafe(
    "SELECT resource, action FROM user_permissions WHERE user_id = ? ORDER BY resource ASC, action ASC",
    userId,
  );
  return rows.map(({ resource, action }) => ({ resource, action }));
};

export const replaceUserPermissions = async (userId, permissions = []) => {
  await ensurePermissionTable();
  const normalized = permissions
    .map(normalizePermission)
    .filter(({ resource, action }) => resource && action);
  const unique = Array.from(
    new Map(normalized.map((permission) => [`${permission.resource}:${permission.action}`, permission])).values(),
  );

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("DELETE FROM user_permissions WHERE user_id = ?", userId);
    for (const permission of unique) {
      await tx.$executeRawUnsafe(
        "INSERT INTO user_permissions (user_id, resource, action) VALUES (?, ?, ?)",
        userId,
        permission.resource,
        permission.action,
      );
    }
  });

  return getUserPermissions(userId);
};

export const getEffectivePermissionsForUser = async (user) => {
  if (isSuperAdminRole(user?.role)) return [{ resource: "*", action: "*" }];
  return getUserPermissions(user?.id);
};
