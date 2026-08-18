import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { single } from "../utils/response.js";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const [patients, opdToday, opdUpcoming, opdCompleted, revenueRows, recentPatients, recentOpd] =
    await Promise.all([
      prisma.patient.count(),
      prisma.opdAppointment.count({
        where: { appointmentDate: { gte: startOfToday(), lte: endOfToday() } },
      }),
      prisma.opdAppointment.count({
        where: { appointmentDate: { gt: endOfToday() } },
      }),
      prisma.opdAppointment.count({
        where: { status: "completed" },
      }),
      prisma.opdAppointment.findMany({
        select: { amount: true, paidAmount: true },
        where: { appointmentDate: { gte: startOfToday(), lte: endOfToday() } },
      }),
      prisma.patient.findMany({
        take: 5,
        orderBy: { registeredAt: "desc" },
        select: { id: true, name: true, phone: true, uhid: true, registeredAt: true },
      }),
      prisma.opdAppointment.findMany({
        take: 5,
        orderBy: { appointmentDate: "desc" },
        include: {
          patient: { select: { name: true, uhid: true } },
          consultantDoctor: { select: { name: true } },
          department: { select: { name: true } },
        },
      }),
    ]);

  const todayRevenue = revenueRows.reduce(
    (sum, row) => sum + Number(row.paidAmount || row.amount || 0),
    0,
  );

  return single(res, {
    totals: {
      patients,
      opdToday,
      opdUpcoming,
      opdCompleted,
      todayRevenue,
    },
    recentPatients,
    recentOpd,
  });
});
