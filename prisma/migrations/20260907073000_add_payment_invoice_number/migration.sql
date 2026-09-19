-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "invoiceNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");
