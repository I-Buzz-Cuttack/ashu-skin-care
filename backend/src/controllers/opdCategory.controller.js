import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

// GET /opd-charge-categories
export const getOpdCategories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { isActive } = req.query;
  const where = isActive !== undefined ? { isActive: isActive === "true" || isActive === true } : {};

  const [data, total] = await Promise.all([
    prisma.opdChargeCategory.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }),
    prisma.opdChargeCategory.count({ where }),
  ]);
  return paginated(res, { data, page, limit, total });
});

export const createOpdCategory = asyncHandler(async (req, res) => {
  const category = await prisma.opdChargeCategory.create({ data: req.body });
  return single(res, category, 201);
});

export const updateOpdCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const category = await prisma.opdChargeCategory.update({ where: { id: req.params.id }, data: body });
  return single(res, category);
});

export const deleteOpdCategory = asyncHandler(async (req, res) => {
  await prisma.opdChargeCategory.delete({ where: { id: req.params.id } });
  return noContent(res);
});
