-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "recurringGroupId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "recurringIndex" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Booking" ADD COLUMN "recurringTotal" INTEGER NOT NULL DEFAULT 1;
