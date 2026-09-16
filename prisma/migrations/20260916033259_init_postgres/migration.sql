-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suburb" TEXT,
    "cityId" TEXT,
    "bio" TEXT,
    "ndisNumber" TEXT,
    "agedCareRef" TEXT,
    "handoverAccess" TEXT,
    "handoverCare" TEXT,
    "handoverEmergency" TEXT,
    "proposalAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "lastProposalAlertedCount" INTEGER NOT NULL DEFAULT 0,
    "proposalAlertedAt" TIMESTAMP(3),

    CONSTRAINT "FamilyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbrev" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suburb" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "Suburb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pluralName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "hourlyRateCents" INTEGER NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "suburb" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "abn" TEXT,
    "instantBook" BOOLEAN NOT NULL DEFAULT false,
    "availableNow" BOOLEAN NOT NULL DEFAULT false,
    "availabilityNote" TEXT,
    "weeklyHours" TEXT,
    "noticeHours" INTEGER NOT NULL DEFAULT 4,
    "jobsLastSeenCount" INTEGER NOT NULL DEFAULT 0,
    "jobsSeenAt" TIMESTAMP(3),
    "jobAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "lastJobAlertedCount" INTEGER NOT NULL DEFAULT 0,
    "jobAlertedAt" TIMESTAMP(3),
    "inviteAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "lastInviteAlertedCount" INTEGER NOT NULL DEFAULT 0,
    "inviteAlertedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "verifiedHours" INTEGER NOT NULL DEFAULT 0,
    "stripeAccountId" TEXT,

    CONSTRAINT "CaregiverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverWeeklyWindow" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,

    CONSTRAINT "CaregiverWeeklyWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverBlockedDate" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaregiverBlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverSpecialty" (
    "caregiverId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,

    CONSTRAINT "CaregiverSpecialty_pkey" PRIMARY KEY ("caregiverId","specialtyId")
);

-- CreateTable
CREATE TABLE "WorkHistory" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "duties" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "hours" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuingState" TEXT,
    "number" TEXT,
    "expiresAt" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRequest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetType" TEXT NOT NULL,
    "budgetCents" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "hoursEstimate" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "careRequestId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "rateCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "familyNote" TEXT,
    "counterRateCents" INTEGER,
    "counterNote" TEXT,
    "counteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRequestInvite" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareRequestInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareRequestMessage" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareRequestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "careRequestId" TEXT,
    "specialtyId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "rateCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL,
    "gstCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "notes" TEXT,
    "handoverAccess" TEXT,
    "handoverCare" TEXT,
    "handoverEmergency" TEXT,
    "disputeNote" TEXT,
    "disputedAt" TIMESTAMP(3),
    "disputeReply" TEXT,
    "disputeRepliedAt" TIMESTAMP(3),
    "declineNote" TEXT,
    "declinedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "recurringGroupId" TEXT,
    "recurringIndex" INTEGER NOT NULL DEFAULT 1,
    "recurringTotal" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL,
    "caregiverPayoutCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "heldAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "lastSeenCount" INTEGER NOT NULL DEFAULT 0,
    "seenAt" TIMESTAMP(3),
    "alertsOn" BOOLEAN NOT NULL DEFAULT true,
    "lastAlertedCount" INTEGER NOT NULL DEFAULT 0,
    "alertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyProfile_userId_key" ON "FamilyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_stateId_slug_key" ON "City"("stateId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Suburb_cityId_slug_key" ON "Suburb"("cityId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverProfile_userId_key" ON "CaregiverProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverProfile_slug_key" ON "CaregiverProfile"("slug");

-- CreateIndex
CREATE INDEX "CaregiverWeeklyWindow_caregiverId_idx" ON "CaregiverWeeklyWindow"("caregiverId");

-- CreateIndex
CREATE INDEX "CaregiverWeeklyWindow_weekday_idx" ON "CaregiverWeeklyWindow"("weekday");

-- CreateIndex
CREATE INDEX "CaregiverBlockedDate_dateKey_idx" ON "CaregiverBlockedDate"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverBlockedDate_caregiverId_dateKey_key" ON "CaregiverBlockedDate"("caregiverId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "CareRequest_slug_key" ON "CareRequest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_careRequestId_caregiverId_key" ON "Proposal"("careRequestId", "caregiverId");

-- CreateIndex
CREATE INDEX "CareRequestInvite_caregiverId_status_idx" ON "CareRequestInvite"("caregiverId", "status");

-- CreateIndex
CREATE INDEX "CareRequestInvite_requestId_status_idx" ON "CareRequestInvite"("requestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CareRequestInvite_requestId_caregiverId_key" ON "CareRequestInvite"("requestId", "caregiverId");

-- CreateIndex
CREATE INDEX "CareRequestMessage_requestId_caregiverId_idx" ON "CareRequestMessage"("requestId", "caregiverId");

-- CreateIndex
CREATE INDEX "CareRequestMessage_caregiverId_readAt_idx" ON "CareRequestMessage"("caregiverId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_familyId_caregiverId_key" ON "Shortlist"("familyId", "caregiverId");

-- CreateIndex
CREATE INDEX "SavedSearch_familyId_idx" ON "SavedSearch"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedSearch_familyId_href_key" ON "SavedSearch"("familyId", "href");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarFeed_userId_key" ON "CalendarFeed"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarFeed_token_key" ON "CalendarFeed"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- AddForeignKey
ALTER TABLE "FamilyProfile" ADD CONSTRAINT "FamilyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyProfile" ADD CONSTRAINT "FamilyProfile_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suburb" ADD CONSTRAINT "Suburb_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverProfile" ADD CONSTRAINT "CaregiverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverProfile" ADD CONSTRAINT "CaregiverProfile_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverWeeklyWindow" ADD CONSTRAINT "CaregiverWeeklyWindow_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverBlockedDate" ADD CONSTRAINT "CaregiverBlockedDate_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverSpecialty" ADD CONSTRAINT "CaregiverSpecialty_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverSpecialty" ADD CONSTRAINT "CaregiverSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkHistory" ADD CONSTRAINT "WorkHistory_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequest" ADD CONSTRAINT "CareRequest_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_careRequestId_fkey" FOREIGN KEY ("careRequestId") REFERENCES "CareRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequestInvite" ADD CONSTRAINT "CareRequestInvite_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CareRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequestInvite" ADD CONSTRAINT "CareRequestInvite_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequestMessage" ADD CONSTRAINT "CareRequestMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CareRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequestMessage" ADD CONSTRAINT "CareRequestMessage_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRequestMessage" ADD CONSTRAINT "CareRequestMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_careRequestId_fkey" FOREIGN KEY ("careRequestId") REFERENCES "CareRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarFeed" ADD CONSTRAINT "CalendarFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
