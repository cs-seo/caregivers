-- CreateTable
CREATE TABLE "CareRequestInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareRequestInvite_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CareRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CareRequestInvite_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CareRequestInvite_requestId_caregiverId_key" ON "CareRequestInvite"("requestId", "caregiverId");

-- CreateIndex
CREATE INDEX "CareRequestInvite_caregiverId_status_idx" ON "CareRequestInvite"("caregiverId", "status");

-- CreateIndex
CREATE INDEX "CareRequestInvite_requestId_status_idx" ON "CareRequestInvite"("requestId", "status");
