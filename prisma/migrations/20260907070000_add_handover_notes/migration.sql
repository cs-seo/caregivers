-- AlterTable
ALTER TABLE "FamilyProfile" ADD COLUMN "handoverAccess" TEXT;
ALTER TABLE "FamilyProfile" ADD COLUMN "handoverCare" TEXT;
ALTER TABLE "FamilyProfile" ADD COLUMN "handoverEmergency" TEXT;
ALTER TABLE "Booking" ADD COLUMN "handoverAccess" TEXT;
ALTER TABLE "Booking" ADD COLUMN "handoverCare" TEXT;
ALTER TABLE "Booking" ADD COLUMN "handoverEmergency" TEXT;
