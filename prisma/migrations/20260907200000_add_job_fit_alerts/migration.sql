-- AlterTable
ALTER TABLE "CaregiverProfile" ADD COLUMN "jobAlertsOn" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CaregiverProfile" ADD COLUMN "lastJobAlertedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CaregiverProfile" ADD COLUMN "jobAlertedAt" DATETIME;
