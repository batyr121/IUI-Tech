ALTER TABLE "HomeworkPlan" ALTER COLUMN "sourceDiagnosticId" DROP NOT NULL;

ALTER TABLE "HomeworkPlan" ADD COLUMN "sourceEegSessionId" TEXT;

ALTER TABLE "HomeworkPlan"
  ADD CONSTRAINT "HomeworkPlan_sourceEegSessionId_fkey"
  FOREIGN KEY ("sourceEegSessionId") REFERENCES "EegSession"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "HomeworkPlan_sourceEegSessionId_idx" ON "HomeworkPlan"("sourceEegSessionId");
