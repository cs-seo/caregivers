-- AlterTable
ALTER TABLE "CaregiverProfile" ADD COLUMN "jobsLastSeenCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CaregiverProfile" ADD COLUMN "jobsSeenAt" DATETIME;
