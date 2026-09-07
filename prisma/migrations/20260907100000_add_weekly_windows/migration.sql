-- CreateTable
CREATE TABLE "CaregiverWeeklyWindow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caregiverId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    CONSTRAINT "CaregiverWeeklyWindow_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CaregiverWeeklyWindow_caregiverId_idx" ON "CaregiverWeeklyWindow"("caregiverId");

-- CreateIndex
CREATE INDEX "CaregiverWeeklyWindow_weekday_idx" ON "CaregiverWeeklyWindow"("weekday");
