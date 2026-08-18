import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { single } from "../utils/response.js";

const REFRESH_COOKIE_NAME = "hms_refresh_token";
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const refreshSecret = () => process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}:refresh`;

const parseDurationMs = (value, fallbackMs) => {
  const match = String(value || "").trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[unit];
};

const refreshMaxAge = () => parseDurationMs(REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000);

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge: refreshMaxAge(),
});

const clearRefreshCookie = (res) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

const signAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, roleId: user.roleId, typ: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

const signRefreshToken = (user, tokenId) =>
  jwt.sign({ id: user.id, jti: tokenId, typ: "refresh" }, refreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const getCookie = (req, name) => {
  const header = req.headers.cookie || "";
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

const issueRefreshToken = async (res, user) => {
  const expiresAt = new Date(Date.now() + refreshMaxAge());
  const record = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: crypto.randomBytes(32).toString("hex"),
      expiresAt,
    },
  });
  const refreshToken = signRefreshToken(user, record.id);
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { tokenHash: hashToken(refreshToken) },
  });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
  return { id: record.id, token: refreshToken };
};

const revokePresentedToken = async (recordId, replacementId = null) => {
  await prisma.refreshToken.update({
    where: { id: recordId },
    data: { revokedAt: new Date(), replacedByTokenId: replacementId },
  });
};

const sanitize = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// POST /auth/register  — convenience endpoint to create the first admin / any staff user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, roleId, departmentId, designationId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "A user with this email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      phone,
      role: role || "SUPER_ADMIN",
      roleId: roleId ?? 1,
      departmentId: departmentId || null,
      designationId: designationId || null,
    },
  });

  await issueRefreshToken(res, user);
  const accessToken = signAccessToken(user);
  return single(res, { user: sanitize(user), accessToken, token: accessToken, role: user.role, permissions: [] }, 201);
});

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null, expiresAt: { lt: new Date() } },
    data: { revokedAt: new Date() },
  });

  await issueRefreshToken(res, user);
  const accessToken = signAccessToken(user);
  return single(res, { user: sanitize(user), accessToken, token: accessToken, role: user.role, permissions: [] });
});

// POST /auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const presentedToken = getCookie(req, REFRESH_COOKIE_NAME) || req.body?.refreshToken;
  if (!presentedToken) return res.status(401).json({ message: "Refresh token required" });

  let decoded;
  try {
    decoded = jwt.verify(presentedToken, refreshSecret());
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  if (decoded.typ !== "refresh" || !decoded.jti) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: decoded.jti },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.tokenHash !== hashToken(presentedToken)) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  if (tokenRecord.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token reuse detected" });
  }

  if (tokenRecord.expiresAt <= new Date() || !tokenRecord.user?.isActive) {
    await revokePresentedToken(tokenRecord.id);
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token expired" });
  }

  const nextRefresh = await issueRefreshToken(res, tokenRecord.user);
  await revokePresentedToken(tokenRecord.id, nextRefresh.id);

  const accessToken = signAccessToken(tokenRecord.user);
  return single(res, {
    user: sanitize(tokenRecord.user),
    accessToken,
    token: accessToken,
    role: tokenRecord.user.role,
    permissions: [],
  });
});

// POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  const presentedToken = getCookie(req, REFRESH_COOKIE_NAME) || req.body?.refreshToken;
  if (presentedToken) {
    try {
      const decoded = jwt.verify(presentedToken, refreshSecret());
      if (decoded?.jti) await revokePresentedToken(decoded.jti);
    } catch {
      // Cookie is already unusable; clearing it is enough.
    }
  }
  clearRefreshCookie(res);
  return single(res, { message: "Logged out" });
});

// GET /auth/me
export const me = asyncHandler(async (req, res) => {
  return single(res, { user: sanitize(req.user) });
});
