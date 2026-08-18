import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes             from "./routes/auth.routes.js";
import patientRoutes          from "./routes/patient.routes.js";
import opdAppointmentRoutes   from "./routes/opdAppointment.routes.js";
import opdCategoryRoutes      from "./routes/opdCategory.routes.js";
import opdChargeRoutes        from "./routes/opdCharge.routes.js";
import userRoutes             from "./routes/user.routes.js";
import departmentRoutes       from "./routes/department.routes.js";
import designationRoutes      from "./routes/designation.routes.js";
import prescriptionRoutes     from "./routes/prescription.routes.js";
import pathologyMasterRoutes  from "./routes/pathologyMaster.routes.js";
import hospitalRoutes         from "./routes/hospital.routes.js";
import permissionRoutes       from "./routes/permission.routes.js";
import dashboardRoutes        from "./routes/dashboard.routes.js";

import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Routes match exactly what the frontend calls (see src/api/apiClient.js,
// which prefixes every request with /api — see utils/apiBaseUrl.js).
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/opd-appointments", opdAppointmentRoutes);
app.use("/api/opd-charge-categories", opdCategoryRoutes);
app.use("/api/opd-consultation-charges", opdChargeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/designation", designationRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/pathology-master", pathologyMasterRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
