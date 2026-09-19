-- CreateTable
CREATE TABLE "CaregiverBlockedDate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caregiverId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaregiverBlockedDate_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverBlockedDate_caregiverId_dateKey_key" ON "CaregiverBlockedDate"("caregiverId", "dateKey");

-- CreateIndex
CREATE INDEX "CaregiverBlockedDate_dateKey_idx" ON "CaregiverBlockedDate"("dateKey");
