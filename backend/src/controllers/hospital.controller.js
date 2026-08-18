import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

// GET /hospital
export const getHospitals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    prisma.hospital.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
    prisma.hospital.count(),
  ]);
  return paginated(res, { data, page, limit, total });
});

export const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await prisma.hospital.findUnique({ where: { id: req.params.id } });
  if (!hospital) return res.status(404).json({ message: "Hospital not found" });
  return single(res, hospital);
});

export const createHospital = asyncHandler(async (req, res) => {
  const hospital = await prisma.hospital.create({ data: req.body });
  return single(res, hospital, 201);
});

export const updateHospital = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  const hospital = await prisma.hospital.update({ where: { id: req.params.id }, data: body });
  return single(res, hospital);
});

export const deleteHospital = asyncHandler(async (req, res) => {
  await prisma.hospital.delete({ where: { id: req.params.id } });
  return noContent(res);
});
