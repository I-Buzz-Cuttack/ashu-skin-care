import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);
  const superAdminPassword = await bcrypt.hash("superadmin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@clinic.test" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@clinic.test",
      password,
      role: "SUPER_ADMIN",
      roleId: 1,
    },
  });

  await prisma.user.upsert({
    where: { email: "superadmin@hospital.com" },
    update: {
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      roleId: 1,
      isActive: true,
    },
    create: {
      name: "Hospital Super Admin",
      email: "superadmin@hospital.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      roleId: 1,
    },
  });

  const department = await prisma.department.upsert({
    where: { name: "General Medicine" },
    update: {},
    create: { name: "General Medicine", isActive: true },
  });

  await prisma.department.upsert({
    where: { name: "Pediatrics" },
    update: {},
    create: { name: "Pediatrics", isActive: true },
  });

  const doctorPassword = await bcrypt.hash("Doctor@123", 10);
  await prisma.user.upsert({
    where: { email: "doctor@clinic.test" },
    update: {},
    create: {
      name: "Dr. Aditi Sharma",
      email: "doctor@clinic.test",
      password: doctorPassword,
      role: "DOCTOR",
      roleId: 2,
      departmentId: department.id,
    },
  });

  const category = await prisma.opdChargeCategory.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General", isActive: true },
  });

  await prisma.opdConsultationCharge.upsert({
    where: { id: "seed-opd-charge-general" },
    update: {},
    create: {
      id: "seed-opd-charge-general",
      name: "OPD Consultation - General",
      standardCharge: 500,
      discountPercentage: 0,
      taxPercentage: 0,
      isActive: true,
      chargeCategoryId: category.id,
      departmentId: department.id,
    },
  });

  await prisma.pathologyMaster.upsert({
    where: { id: "seed-pathology-cbc" },
    update: {},
    create: { id: "seed-pathology-cbc", testName: "Complete Blood Count (CBC)", isActive: true },
  });

  await prisma.hospital.upsert({
    where: { id: "seed-hospital-main" },
    update: {},
    create: {
      id: "seed-hospital-main",
      name: "City General Hospital",
      address: "123 Medical Lane, Health City",
      phone: "+91-9800000000",
      isActive: true,
    },
  });

  console.log("Seed complete.");
  console.log("Login with: admin@clinic.test / Admin@123 (SUPER_ADMIN)");
  console.log("            superadmin@hospital.com / superadmin@123 (SUPER_ADMIN)");
  console.log("            doctor@clinic.test / Doctor@123 (DOCTOR)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
