import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

const pad = (n, len) => String(n).padStart(len, "0");

const dateCode = (date) => {
  const d = new Date(date);
  return `${pad(d.getDate(), 2)}${pad(d.getMonth() + 1, 2)}${d.getFullYear()}`;
};

// Generates the same date-coded token/opd-number format the frontend
// falls back to client-side (TKN-DDMMYYYY-NNNNN / OPD-DDMMYYYY-NNNNN),
// so records look consistent whether the id came from us or was
// reconstructed on the client.
const generateIdentifiers = async (appointmentDate) => {
  const code = dateCode(appointmentDate);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const countToday = await prisma.opdAppointment.count({
    where: { appointmentDate: { gte: startOfDay, lte: endOfDay } },
  });

  const seq = pad(countToday + 1, 5);
  return { opdNo: `TKN-${code}-${seq}`, caseId: `OPD-${code}-${seq}` };
};

const numeric = (v, fallback = 0) => (v === undefined || v === null || v === "" ? fallback : Number(v));
const bool = (v) => v === true || v === "true";
const strOrNull = (v) => (v === undefined || v === "" ? null : v);

const buildData = (body) => ({
  appointmentId: strOrNull(body.appointmentId),
  patientId: body.patientId,
  appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : new Date(),
  departmentId: strOrNull(body.departmentId),
  consultantDoctorId: strOrNull(body.consultantDoctorId),
  reference: strOrNull(body.reference),
  generatedBy: strOrNull(body.generatedBy),
  isOldPatient: bool(body.isOldPatient),
  isCasualty: bool(body.isCasualty),
  isAntenatal: bool(body.isAntenatal),
  isLiveConsultation: bool(body.isLiveConsultation),
  symptomsType: strOrNull(body.symptomsType),
  symptomsTitle: strOrNull(body.symptomsTitle),
  symptomsDescription: strOrNull(body.symptomsDescription),
  note: strOrNull(body.note),
  knownAllergies: strOrNull(body.knownAllergies),
  previousMedicalIssue: strOrNull(body.previousMedicalIssue),
  primaryDiagnosis: strOrNull(body.primaryDiagnosis),
  chargeCategoryId: strOrNull(body.chargeCategoryId),
  chargeId: strOrNull(body.chargeId),
  standardCharge: numeric(body.standardCharge),
  appliedCharge: numeric(body.appliedCharge),
  discountPercentage: numeric(body.discountPercentage),
  discountAmount: numeric(body.discountAmount),
  taxPercentage: numeric(body.taxPercentage),
  taxAmount: numeric(body.taxAmount),
  amount: numeric(body.amount),
  paidAmount: numeric(body.paidAmount),
  paymentMode: body.paymentMode || "cash",
  applyTpa: bool(body.applyTpa),
  tpaId: strOrNull(body.tpaId),
  status: (body.status || "registered").toLowerCase(),
});

// GET /opd-appointments
export const getOpdAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;
  const where = status ? { status: status.toLowerCase() } : {};

  const [data, total] = await Promise.all([
    prisma.opdAppointment.findMany({
      where, skip, take: limit, orderBy: { appointmentDate: "desc" },
      include: {
        patient: { select: { id: true, name: true, uhid: true, phone: true } },
        consultantDoctor: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.opdAppointment.count({ where }),
  ]);
  return paginated(res, { data, page, limit, total });
});

// GET /opd-appointments/:id
export const getOpdAppointmentById = asyncHandler(async (req, res) => {
  const record = await prisma.opdAppointment.findUnique({
    where: { id: req.params.id },
    include: { prescription: true },
  });
  if (!record) return res.status(404).json({ message: "OPD appointment not found" });
  return single(res, record);
});

// POST /opd-appointments (with retry on OPD number collision)
export const createOpdAppointment = asyncHandler(async (req, res) => {
  const data = buildData(req.body);
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { opdNo, caseId } = await generateIdentifiers(data.appointmentDate);
      data.opdNo = opdNo;
      data.caseId = caseId;

      const record = await prisma.opdAppointment.create({ data });
      return single(res, record, 201);
    } catch (err) {
      // P2002 = unique constraint violation — retry with next sequence
      const isOpdCollision = err.code === "P2002" &&
        (err.meta?.target?.includes("opdNo") || err.meta?.target?.includes("caseId"));
      if (isOpdCollision && attempt < maxRetries - 1) continue;
      throw err;
    }
  }
});

// PUT /opd-appointments/:id
export const updateOpdAppointment = asyncHandler(async (req, res) => {
  const data = buildData(req.body);
  // Keep the existing opdNo/caseId — they were assigned at creation time.
  delete data.opdNo;
  delete data.caseId;

  const record = await prisma.opdAppointment.update({ where: { id: req.params.id }, data });
  return single(res, record);
});

// DELETE /opd-appointments/:id
export const deleteOpdAppointment = asyncHandler(async (req, res) => {
  await prisma.opdAppointment.delete({ where: { id: req.params.id } });
  return noContent(res);
});
