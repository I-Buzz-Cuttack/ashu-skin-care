-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'SUPER_ADMIN',
    `role_id` INTEGER NOT NULL DEFAULT 1,
    `department_id` VARCHAR(191) NULL,
    `designation_id` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `designations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `designations_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients` (
    `id` VARCHAR(191) NOT NULL,
    `uhid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `marital_status` ENUM('single', 'married', 'divorced', 'widowed') NULL,
    `blood_group` ENUM('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG') NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `adhar_no` VARCHAR(191) NULL,
    `insurance_provider` VARCHAR(191) NULL,
    `insurance_policy_no` VARCHAR(191) NULL,
    `emergency_contact_name` VARCHAR(191) NULL,
    `emergency_contact_phone` VARCHAR(191) NULL,
    `emergency_contact_relation` VARCHAR(191) NULL,
    `referredBy` VARCHAR(191) NULL,
    `occupation` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `hospital_id` VARCHAR(191) NULL,
    `allergies` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `patients_uhid_key`(`uhid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opd_charge_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `opd_charge_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opd_consultation_charges` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `standardCharge` DOUBLE NOT NULL DEFAULT 0,
    `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    `taxPercentage` DOUBLE NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `chargeCategoryId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `doctorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opd_appointments` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NULL,
    `opdNo` VARCHAR(191) NULL,
    `caseId` VARCHAR(191) NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `appointmentDate` DATETIME(3) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `consultantDoctorId` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `generatedBy` VARCHAR(191) NULL,
    `isOldPatient` BOOLEAN NOT NULL DEFAULT false,
    `isCasualty` BOOLEAN NOT NULL DEFAULT false,
    `isAntenatal` BOOLEAN NOT NULL DEFAULT false,
    `isLiveConsultation` BOOLEAN NOT NULL DEFAULT false,
    `symptomsType` VARCHAR(191) NULL,
    `symptomsTitle` VARCHAR(191) NULL,
    `symptomsDescription` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `knownAllergies` VARCHAR(191) NULL,
    `previousMedicalIssue` VARCHAR(191) NULL,
    `primaryDiagnosis` VARCHAR(191) NULL,
    `chargeCategoryId` VARCHAR(191) NULL,
    `chargeId` VARCHAR(191) NULL,
    `standardCharge` DOUBLE NOT NULL DEFAULT 0,
    `appliedCharge` DOUBLE NOT NULL DEFAULT 0,
    `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `taxPercentage` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `paidAmount` DOUBLE NOT NULL DEFAULT 0,
    `paymentMode` VARCHAR(191) NOT NULL DEFAULT 'cash',
    `applyTpa` BOOLEAN NOT NULL DEFAULT false,
    `tpaId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'registered',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `opd_appointments_opdNo_key`(`opdNo`),
    UNIQUE INDEX `opd_appointments_caseId_key`(`caseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` VARCHAR(191) NOT NULL,
    `opdAppointmentId` VARCHAR(191) NOT NULL,
    `vitalSigns` JSON NULL,
    `medicines` JSON NULL,
    `radiologies` JSON NULL,
    `pathologies` JSON NULL,
    `chiefComplaint` VARCHAR(191) NULL,
    `diagnosis` VARCHAR(191) NULL,
    `diagnosisCode` VARCHAR(191) NULL,
    `findingCategory` VARCHAR(191) NULL,
    `findingList` VARCHAR(191) NULL,
    `findingDesc` VARCHAR(191) NULL,
    `advice` VARCHAR(191) NULL,
    `followUpDate` DATETIME(3) NULL,
    `referredTo` VARCHAR(191) NULL,
    `headerNote` VARCHAR(191) NULL,
    `footerNote` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `prescriptions_opdAppointmentId_key`(`opdAppointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospitals` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pathology_master` (
    `id` VARCHAR(191) NOT NULL,
    `testName` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_designation_id_fkey` FOREIGN KEY (`designation_id`) REFERENCES `designations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_consultation_charges` ADD CONSTRAINT `opd_consultation_charges_chargeCategoryId_fkey` FOREIGN KEY (`chargeCategoryId`) REFERENCES `opd_charge_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_consultation_charges` ADD CONSTRAINT `opd_consultation_charges_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_consultation_charges` ADD CONSTRAINT `opd_consultation_charges_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_appointments` ADD CONSTRAINT `opd_appointments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_appointments` ADD CONSTRAINT `opd_appointments_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_appointments` ADD CONSTRAINT `opd_appointments_consultantDoctorId_fkey` FOREIGN KEY (`consultantDoctorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_appointments` ADD CONSTRAINT `opd_appointments_chargeCategoryId_fkey` FOREIGN KEY (`chargeCategoryId`) REFERENCES `opd_charge_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opd_appointments` ADD CONSTRAINT `opd_appointments_chargeId_fkey` FOREIGN KEY (`chargeId`) REFERENCES `opd_consultation_charges`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_opdAppointmentId_fkey` FOREIGN KEY (`opdAppointmentId`) REFERENCES `opd_appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
