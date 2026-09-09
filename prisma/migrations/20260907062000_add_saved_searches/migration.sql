-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedSearch_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedSearch_familyId_href_key" ON "SavedSearch"("familyId", "href");

-- CreateIndex
CREATE INDEX "SavedSearch_familyId_idx" ON "SavedSearch"("familyId");
