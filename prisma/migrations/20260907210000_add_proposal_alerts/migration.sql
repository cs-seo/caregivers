-- AlterTable
ALTER TABLE "FamilyProfile" ADD COLUMN "proposalAlertsOn" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "FamilyProfile" ADD COLUMN "lastProposalAlertedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FamilyProfile" ADD COLUMN "proposalAlertedAt" DATETIME;
