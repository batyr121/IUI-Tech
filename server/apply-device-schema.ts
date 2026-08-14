import 'dotenv/config';

process.env.DATABASE_URL = process.env.DIRECT_URL;
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
try {
  await prisma.$executeRawUnsafe('ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "sensorModel" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "sampleRate" INTEGER');
  await prisma.$executeRawUnsafe('ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "connectedByUserId" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "connectedStudentId" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "parentStudentId" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "weeklyGoal" INTEGER NOT NULL DEFAULT 3');
  await prisma.$executeRawUnsafe('ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT');
  await prisma.$executeRawUnsafe(`UPDATE "Class" SET "inviteCode" = 'CLASS-' || UPPER(SUBSTRING(MD5("id") FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(MD5("id") FROM 5 FOR 4)) WHERE "inviteCode" IS NULL`);
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Class_inviteCode_key" ON "Class"("inviteCode")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Invite_organizationId_role_expiresAt_idx" ON "Invite"("organizationId", "role", "expiresAt")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Device_organizationId_status_idx" ON "Device"("organizationId", "status")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Device_connectedStudentId_idx" ON "Device"("connectedStudentId")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "EegSession_status_startedAt_idx" ON "EegSession"("status", "startedAt")');
  console.log('Device ownership, metadata and class codes are ready.');
} finally {
  await prisma.$disconnect();
}
