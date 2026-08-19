import prisma from "../config/db.js";
import {
  getEffectivePermissionsForUser,
  isSuperAdminRole,
  PERMISSION_CATALOG,
} from "./permission.service.js";

const MAX_ROWS = 8;

const hasReadAccess = (permissions, resource) => {
  if (permissions.some((permission) => permission.resource === "*" && permission.action === "*")) {
    return true;
  }
  return permissions.some(
    (permission) => permission.resource === resource && ["read", "*"].includes(permission.action),
  );
};

const asDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

const clean = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const buildSearchWhere = (message) => {
  const query = String(message || "").trim();
  if (!query) return undefined;
  return {
    OR: [
      { name: { contains: query } },
      { phone: { contains: query } },
      { uhid: { contains: query } },
      { email: { contains: query } },
    ],
  };
};

const formatList = (rows, formatter) => {
  if (!rows?.length) return "No records found.";
  return rows.map(formatter).join("\n");
};

const dashboardContext = async () => {
  const [patientCount, todayOpd, upcomingOpd, completedOpd, revenueRows] = await Promise.all([
    prisma.patient.count(),
    prisma.opdAppointment.count({ where: { appointmentDate: { gte: startOfToday(), lte: endOfToday() } } }),
    prisma.opdAppointment.count({ where: { appointmentDate: { gt: endOfToday() } } }),
    prisma.opdAppointment.count({ where: { status: "completed" } }),
    prisma.opdAppointment.findMany({
      where: { appointmentDate: { gte: startOfToday(), lte: endOfToday() } },
      select: { amount: true, paidAmount: true },
    }),
  ]);

  const todayRevenue = revenueRows.reduce((sum, row) => sum + Number(row.paidAmount || row.amount || 0), 0);

  return [
    "Dashboard summary:",
    `Total patients: ${patientCount}`,
    `Today OPD queue: ${todayOpd}`,
    `Upcoming OPD appointments: ${upcomingOpd}`,
    `Completed OPD appointments: ${completedOpd}`,
    `Today collection: ${todayRevenue}`,
  ].join("\n");
};

const patientContext = async (message) => {
  const where = buildSearchWhere(message);
  const [count, recent, matches] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.findMany({
      take: MAX_ROWS,
      orderBy: { registeredAt: "desc" },
      select: {
        uhid: true,
        name: true,
        phone: true,
        gender: true,
        dob: true,
        bloodGroup: true,
        status: true,
        registeredAt: true,
        allergies: true,
        remarks: true,
      },
    }),
    where
      ? prisma.patient.findMany({
          take: MAX_ROWS,
          where,
          orderBy: { registeredAt: "desc" },
          select: {
            id: true,
            uhid: true,
            name: true,
            phone: true,
            gender: true,
            dob: true,
            bloodGroup: true,
            status: true,
            registeredAt: true,
            allergies: true,
            remarks: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return [
    `Patient directory total: ${count}`,
    "Recent patients:",
    formatList(recent, (patient) =>
      `- ${clean(patient.name)} | UHID ${clean(patient.uhid)} | ${clean(patient.phone)} | ${clean(patient.gender)} | Blood ${clean(patient.bloodGroup)} | Registered ${asDate(patient.registeredAt)}`,
    ),
    matches.length ? "Matching patients:" : "",
    matches.length
      ? formatList(matches, (patient) =>
          `- ${clean(patient.name)} | UHID ${clean(patient.uhid)} | Phone ${clean(patient.phone)} | Status ${clean(patient.status)} | Allergies ${clean(patient.allergies)} | Remarks ${clean(patient.remarks)}`,
        )
      : "",
  ].filter(Boolean).join("\n");
};

const opdContext = async () => {
  const rows = await prisma.opdAppointment.findMany({
    take: MAX_ROWS,
    orderBy: { appointmentDate: "desc" },
    include: {
      patient: { select: { name: true, uhid: true, phone: true } },
      consultantDoctor: { select: { name: true } },
      department: { select: { name: true } },
    },
  });

  return [
    "Recent OPD appointments:",
    formatList(rows, (opd) =>
      `- OPD ${clean(opd.opdNo)} | ${asDate(opd.appointmentDate)} | Patient ${clean(opd.patient?.name)} (${clean(opd.patient?.uhid)}) | Doctor ${clean(opd.consultantDoctor?.name)} | Department ${clean(opd.department?.name)} | Status ${clean(opd.status)} | Amount ${clean(opd.amount)} | Paid ${clean(opd.paidAmount)} | Diagnosis ${clean(opd.primaryDiagnosis)}`,
    ),
  ].join("\n");
};

const prescriptionContext = async () => {
  const rows = await prisma.prescription.findMany({
    take: MAX_ROWS,
    orderBy: { createdAt: "desc" },
    include: {
      opdAppointment: {
        include: {
          patient: { select: { name: true, uhid: true, phone: true } },
          consultantDoctor: { select: { name: true } },
        },
      },
    },
  });

  return [
    "Recent prescriptions:",
    formatList(rows, (prescription) =>
      `- Patient ${clean(prescription.opdAppointment?.patient?.name)} (${clean(prescription.opdAppointment?.patient?.uhid)}) | Doctor ${clean(prescription.opdAppointment?.consultantDoctor?.name)} | Diagnosis ${clean(prescription.diagnosis)} | Complaint ${clean(prescription.chiefComplaint)} | Advice ${clean(prescription.advice)} | Status ${clean(prescription.status)} | Created ${asDate(prescription.createdAt)}`,
    ),
  ].join("\n");
};

const doctorContext = async () => {
  const rows = await prisma.user.findMany({
    take: MAX_ROWS,
    where: { OR: [{ role: { contains: "DOCTOR" } }, { roleId: 2 }] },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      department: { select: { name: true } },
      designation: { select: { name: true } },
    },
  });

  return [
    "Doctors:",
    formatList(rows, (doctor) =>
      `- ${clean(doctor.name)} | ${clean(doctor.email)} | ${clean(doctor.phone)} | Department ${clean(doctor.department?.name)} | Designation ${clean(doctor.designation?.name)} | Active ${doctor.isActive ? "yes" : "no"}`,
    ),
  ].join("\n");
};

const memberContext = async () => {
  const rows = await prisma.user.findMany({
    take: MAX_ROWS,
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return [
    "Staff members:",
    formatList(rows, (member) =>
      `- ${clean(member.name)} | ${clean(member.email)} | ${clean(member.phone)} | Role ${clean(member.role)} | Active ${member.isActive ? "yes" : "no"} | Created ${asDate(member.createdAt)}`,
    ),
  ].join("\n");
};

const billingContext = async () => {
  const rows = await prisma.opdAppointment.findMany({
    take: MAX_ROWS,
    orderBy: { appointmentDate: "desc" },
    select: {
      opdNo: true,
      appointmentDate: true,
      amount: true,
      paidAmount: true,
      paymentMode: true,
      patient: { select: { name: true, uhid: true } },
    },
  });
  const totalPaid = rows.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0);

  return [
    `Recent billing paid total: ${totalPaid}`,
    "Recent billing records:",
    formatList(rows, (row) =>
      `- OPD ${clean(row.opdNo)} | ${asDate(row.appointmentDate)} | Patient ${clean(row.patient?.name)} (${clean(row.patient?.uhid)}) | Amount ${clean(row.amount)} | Paid ${clean(row.paidAmount)} | Mode ${clean(row.paymentMode)}`,
    ),
  ].join("\n");
};

const permissionContext = async (user) => {
  const permissions = await getEffectivePermissionsForUser(user);
  return [
    `Current user: ${clean(user?.name)} | Role ${clean(user?.role)} | Super Admin ${isSuperAdminRole(user?.role) ? "yes" : "no"}`,
    "Permission catalog:",
    PERMISSION_CATALOG.map((item) => `- ${item.label}: ${item.actions.join(", ")}`).join("\n"),
    "Current effective permissions:",
    permissions.map((permission) => `- ${permission.resource}:${permission.action}`).join("\n"),
  ].join("\n");
};

export const buildChatbotWebsiteContext = async ({ user, message }) => {
  const permissions = await getEffectivePermissionsForUser(user);
  const sections = [];

  const loaders = [
    ["dashboard", dashboardContext],
    ["patient", () => patientContext(message)],
    ["opd", opdContext],
    ["prescription", prescriptionContext],
    ["doctor", doctorContext],
    ["user", memberContext],
    ["billing", billingContext],
    ["ipd", opdContext],
    ["permission", () => permissionContext(user)],
  ];

  for (const [resource, loader] of loaders) {
    if (!hasReadAccess(permissions, resource)) continue;
    try {
      sections.push(await loader());
    } catch (error) {
      sections.push(`${resource} data could not be loaded.`);
    }
  }

  if (!sections.length) {
    return "The logged-in user does not have permission to read website data.";
  }

  return sections.join("\n\n");
};
