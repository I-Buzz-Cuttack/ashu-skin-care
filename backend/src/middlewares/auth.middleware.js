import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.typ && decoded.typ !== "access") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Only allow certain roles. Usage: authorize('SUPER_ADMIN', 'SUB_ADMIN')
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const userRole = normalizeRole(req.user.role);
  const allowedRoles = roles.map(normalizeRole);
  if (userRole === "SUPER_ADMIN") return next();
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  next();
};
