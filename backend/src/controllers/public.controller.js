import prisma from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const getLoginStats = asyncHandler(async (_req, res) => {
  const { start, end } = todayRange();

  const [appointments, consulting, registeredPatients] = await Promise.all([
    prisma.opdAppointment.count({
      where: { appointmentDate: { gte: start, lt: end } },
    }),
    prisma.opdAppointment.count({
      where: {
        appointmentDate: { gte: start, lt: end },
        OR: [
          { status: "consulting" },
          { isLiveConsultation: true },
        ],
      },
    }),
    prisma.patient.count(),
  ]);

  res.json({
    result: {
      appointments,
      consulting,
      registeredPatients,
    },
  });
});
