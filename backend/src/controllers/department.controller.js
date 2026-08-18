import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listResult, single, noContent } from "../utils/response.js";

// GET /department
export const getDepartments = asyncHandler(async (req, res) => {
  const { is_active } = req.query;
  const where = is_active !== undefined ? { isActive: is_active === "true" || is_active === true } : {};
  const data = await prisma.department.findMany({ where, orderBy: { name: "asc" } });
  return listResult(res, data);
});

// GET /department/:id
export const getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!dept) return res.status(404).json({ message: "Department not found" });
  return single(res, dept);
});

// POST /department
export const createDepartment = asyncHandler(async (req, res) => {
  const dept = await prisma.department.create({ data: req.body });
  return single(res, dept, 201);
});

// PUT/PATCH /department/:id
export const updateDepartment = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const dept = await prisma.department.update({ where: { id: req.params.id }, data: body });
  return single(res, dept);
});

// DELETE /department/:id
export const deleteDepartment = asyncHandler(async (req, res) => {
  await prisma.department.delete({ where: { id: req.params.id } });
  return noContent(res);
});
