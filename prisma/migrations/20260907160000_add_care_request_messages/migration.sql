-- CreateTable
CREATE TABLE "CareRequestMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareRequestMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CareRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CareRequestMessage_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CareRequestMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CareRequestMessage_requestId_caregiverId_idx" ON "CareRequestMessage"("requestId", "caregiverId");

-- CreateIndex
CREATE INDEX "CareRequestMessage_caregiverId_readAt_idx" ON "CareRequestMessage"("caregiverId", "readAt");
