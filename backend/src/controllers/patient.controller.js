import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginated, single, noContent } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

// ── Allowed fields for create / update ─────────────────────────────────────
const ALLOWED_FIELDS = [
  "name", "email", "phone", "dob", "gender", "maritalStatus", "bloodGroup",
  "address", "city", "state", "adharNo", "insuranceProvider", "insurancePolicyNo",
  "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation",
  "referredBy", "occupation", "nationality", "hospitalId",
  "allergies", "remarks", "photo",
];

const pick = (source, fields) => {
  const out = {};
  for (const f of fields) {
    if (source[f] !== undefined) out[f] = source[f];
  }
  return out;
};

// ── UHID generator with collision retry ────────────────────────────────────
const generateUhid = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `${day}${m}${y}${rand}`;
};

const createPatientWithRetry = async (data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      data.uhid = generateUhid();
      return await prisma.patient.create({ data });
    } catch (err) {
      // P2002 = unique constraint violation (UHID collision)
      if (err.code === "P2002" && err.meta?.target?.includes("uhid") && i < retries - 1) {
        continue; // retry with new UHID
      }
      throw err;
    }
  }
};

// GET /patient
export const getPatients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search } = req.query;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
          { uhid: { contains: search } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.patient.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.patient.count({ where }),
  ]);

  return paginated(res, { data, page, limit, total });
});

// GET /patient/:id
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  return single(res, patient);
});

// POST /patient
export const createPatient = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ message: "Patient name is required" });
  }

  const data = pick(req.body, ALLOWED_FIELDS);
  if (data.dob) data.dob = new Date(data.dob);

  const patient = await createPatientWithRetry(data);
  return single(res, patient, 201);
});

// PUT /patient/:id
export const updatePatient = asyncHandler(async (req, res) => {
  const data = pick(req.body, ALLOWED_FIELDS);
  if (data.dob) data.dob = new Date(data.dob);

  const patient = await prisma.patient.update({ where: { id: req.params.id }, data });
  return single(res, patient);
});

// DELETE /patient/:id
export const deletePatient = asyncHandler(async (req, res) => {
  await prisma.patient.delete({ where: { id: req.params.id } });
  return noContent(res);
});

