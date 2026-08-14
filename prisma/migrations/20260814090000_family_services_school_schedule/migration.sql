CREATE TABLE "DiagnosticBooking" (
  "id" TEXT NOT NULL, "studentId" TEXT NOT NULL, "createdById" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL, "durationMin" INTEGER NOT NULL DEFAULT 60,
  "format" TEXT NOT NULL DEFAULT 'IN_PERSON', "location" TEXT, "status" TEXT NOT NULL DEFAULT 'BOOKED',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING', "priceKzt" INTEGER NOT NULL DEFAULT 1290,
  "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiagnosticBooking_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FamilySubscription" (
  "id" TEXT NOT NULL, "studentId" TEXT NOT NULL, "planCode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "diagnosticsTotal" INTEGER NOT NULL,
  "diagnosticsUsed" INTEGER NOT NULL DEFAULT 0, "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL, "priceKzt" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilySubscription_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DataConsent" (
  "id" TEXT NOT NULL, "studentId" TEXT NOT NULL, "ownerId" TEXT NOT NULL,
  "consentType" TEXT NOT NULL, "accepted" BOOLEAN NOT NULL, "version" TEXT NOT NULL DEFAULT '1.0',
  "acceptedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "DataConsent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ClassSchedule" (
  "id" TEXT NOT NULL, "classId" TEXT NOT NULL, "weekday" INTEGER NOT NULL, "startsAt" TEXT NOT NULL,
  "durationMin" INTEGER NOT NULL DEFAULT 60, "room" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DiagnosticBooking_studentId_scheduledAt_idx" ON "DiagnosticBooking"("studentId", "scheduledAt");
CREATE INDEX "DiagnosticBooking_scheduledAt_status_idx" ON "DiagnosticBooking"("scheduledAt", "status");
CREATE INDEX "FamilySubscription_studentId_status_idx" ON "FamilySubscription"("studentId", "status");
CREATE UNIQUE INDEX "DataConsent_studentId_ownerId_consentType_key" ON "DataConsent"("studentId", "ownerId", "consentType");
CREATE INDEX "DataConsent_studentId_idx" ON "DataConsent"("studentId");
CREATE INDEX "ClassSchedule_classId_weekday_idx" ON "ClassSchedule"("classId", "weekday");
ALTER TABLE "DiagnosticBooking" ADD CONSTRAINT "DiagnosticBooking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiagnosticBooking" ADD CONSTRAINT "DiagnosticBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FamilySubscription" ADD CONSTRAINT "FamilySubscription_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataConsent" ADD CONSTRAINT "DataConsent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataConsent" ADD CONSTRAINT "DataConsent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
