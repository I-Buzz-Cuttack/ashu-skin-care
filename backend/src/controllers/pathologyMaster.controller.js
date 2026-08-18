import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

export const getPathologyMaster = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { isActive } = req.query;
  const where = isActive !== undefined ? { isActive: isActive === "true" || isActive === true } : {};

  const [data, total] = await Promise.all([
    prisma.pathologyMaster.findMany({ where, skip, take: limit, orderBy: { testName: "asc" } }),
    prisma.pathologyMaster.count({ where }),
  ]);
  return paginated(res, { data, page, limit, total });
});

export const createPathologyMaster = asyncHandler(async (req, res) => {
  const test = await prisma.pathologyMaster.create({ data: req.body });
  return single(res, test, 201);
});

export const updatePathologyMaster = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const test = await prisma.pathologyMaster.update({ where: { id: req.params.id }, data: body });
  return single(res, test);
});

export const deletePathologyMaster = asyncHandler(async (req, res) => {
  await prisma.pathologyMaster.delete({ where: { id: req.params.id } });
  return noContent(res);
});
