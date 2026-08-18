import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginatedFlat, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

const sanitize = (user) => {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
};

// GET /user  (used for both "all staff" and "doctors only" via ?role_id=2, and
// filtered by ?department_id=... when picking a consultant for a department)
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role_id, department_id, search } = req.query;

  const where = {};
  if (role_id !== undefined) where.roleId = Number(role_id);
  if (department_id) where.departmentId = department_id;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: { department: true, designation: true },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedFlat(res, { data: data.map(sanitize), page, limit, total });
});

// GET /user/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { department: true, designation: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return single(res, sanitize(user));
});

// POST /user  (creates staff or, when role_id=2, a doctor)
export const createUser = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const password = body.password || "changeme123"; // default password if none supplied
  delete body.password;

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: await bcrypt.hash(password, 10),
      phone: body.phone,
      role: body.role || (Number(body.role_id ?? body.roleId) === 2 ? "DOCTOR" : "SUPER_ADMIN"),
      roleId: Number(body.role_id ?? body.roleId ?? 1),
      departmentId: body.department_id || body.departmentId || null,
      designationId: body.designation_id || body.designationId || null,
    },
  });
  return single(res, sanitize(user), 201);
});

// PUT/PATCH /user/:id
export const updateUser = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.role !== undefined) data.role = body.role;
  if (body.role_id !== undefined || body.roleId !== undefined) data.roleId = Number(body.role_id ?? body.roleId);
  if (body.department_id !== undefined || body.departmentId !== undefined) data.departmentId = body.department_id ?? body.departmentId;
  if (body.designation_id !== undefined || body.designationId !== undefined) data.designationId = body.designation_id ?? body.designationId;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  return single(res, sanitize(user));
});

// DELETE /user/:id
export const deleteUser = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  return noContent(res);
});
