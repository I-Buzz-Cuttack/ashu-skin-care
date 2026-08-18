import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

// GET /opd-consultation-charges
export const getOpdCharges = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { isActive, chargeCategoryId } = req.query;

  const where = {};
  if (isActive !== undefined) where.isActive = isActive === "true" || isActive === true;
  if (chargeCategoryId) where.chargeCategoryId = chargeCategoryId;

  const [data, total] = await Promise.all([
    prisma.opdConsultationCharge.findMany({
      where, skip, take: limit, orderBy: { name: "asc" },
      include: { chargeCategory: true },
    }),
    prisma.opdConsultationCharge.count({ where }),
  ]);
  return paginated(res, { data, page, limit, total });
});

export const createOpdCharge = asyncHandler(async (req, res) => {
  const charge = await prisma.opdConsultationCharge.create({ data: req.body });
  return single(res, charge, 201);
});

export const updateOpdCharge = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const charge = await prisma.opdConsultationCharge.update({ where: { id: req.params.id }, data: body });
  return single(res, charge);
});

export const deleteOpdCharge = asyncHandler(async (req, res) => {
  await prisma.opdConsultationCharge.delete({ where: { id: req.params.id } });
  return noContent(res);
});
