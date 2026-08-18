import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

// GET /prescription  (OPDPage fetches all, then maps by opdAppointmentId)
export const getPrescriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { opdAppointmentId } = req.query;
  const where = opdAppointmentId ? { opdAppointmentId } : {};

  const [data, total] = await Promise.all([
    prisma.prescription.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.prescription.count({ where }),
  ]);
  return paginated(res, { data, page, limit, total });
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const rx = await prisma.prescription.findUnique({ where: { id: req.params.id } });
  if (!rx) return res.status(404).json({ message: "Prescription not found" });
  return single(res, rx);
});

// POST /prescription  (one prescription per OPD appointment — upsert)
export const createPrescription = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.followUpDate) body.followUpDate = new Date(body.followUpDate);

  const rx = await prisma.prescription.upsert({
    where: { opdAppointmentId: body.opdAppointmentId },
    update: body,
    create: body,
  });
  return single(res, rx, 201);
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  if (body.followUpDate) body.followUpDate = new Date(body.followUpDate);

  const rx = await prisma.prescription.update({ where: { id: req.params.id }, data: body });
  return single(res, rx);
});

export const deletePrescription = asyncHandler(async (req, res) => {
  await prisma.prescription.delete({ where: { id: req.params.id } });
  return noContent(res);
});
