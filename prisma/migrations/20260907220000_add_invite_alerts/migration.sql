-- AlterTable
ALTER TABLE "CaregiverProfile" ADD COLUMN "inviteAlertsOn" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CaregiverProfile" ADD COLUMN "lastInviteAlertedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CaregiverProfile" ADD COLUMN "inviteAlertedAt" DATETIME;
