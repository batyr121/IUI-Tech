ALTER TABLE "HomeworkTask" ADD COLUMN IF NOT EXISTS "taskType" TEXT;
ALTER TABLE "HomeworkTask" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE TABLE IF NOT EXISTS "CognitiveTaskSession" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "homeworkTaskId" TEXT,
  "diagnosticAttemptId" TEXT,
  "eegSessionId" TEXT,
  "taskId" TEXT NOT NULL,
  "taskType" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "difficulty" INTEGER NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'TRAINING',
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "behavioralSummary" JSONB,
  "eegSummary" JSONB,
  "combinedSummary" JSONB,
  "confidence" TEXT NOT NULL DEFAULT 'Low',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CognitiveTaskSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CognitiveTaskEvent" (
  "id" BIGSERIAL NOT NULL,
  "taskSessionId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "payload" JSONB,
  "reactionTimeMs" INTEGER,
  "correct" BOOLEAN,
  "artifactDetected" BOOLEAN NOT NULL DEFAULT false,
  "artifactReason" TEXT,
  "excludedFromScore" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CognitiveTaskEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HomeworkAttempt" ADD COLUMN IF NOT EXISTS "taskSessionId" TEXT;

CREATE INDEX IF NOT EXISTS "HomeworkTask_taskType_idx" ON "HomeworkTask"("taskType");
CREATE INDEX IF NOT EXISTS "HomeworkAttempt_taskSessionId_idx" ON "HomeworkAttempt"("taskSessionId");
CREATE INDEX IF NOT EXISTS "CognitiveTaskSession_studentId_startedAt_idx" ON "CognitiveTaskSession"("studentId", "startedAt");
CREATE INDEX IF NOT EXISTS "CognitiveTaskSession_homeworkTaskId_idx" ON "CognitiveTaskSession"("homeworkTaskId");
CREATE INDEX IF NOT EXISTS "CognitiveTaskSession_diagnosticAttemptId_idx" ON "CognitiveTaskSession"("diagnosticAttemptId");
CREATE INDEX IF NOT EXISTS "CognitiveTaskSession_eegSessionId_idx" ON "CognitiveTaskSession"("eegSessionId");
CREATE INDEX IF NOT EXISTS "CognitiveTaskSession_taskType_idx" ON "CognitiveTaskSession"("taskType");
CREATE INDEX IF NOT EXISTS "CognitiveTaskEvent_taskSessionId_occurredAt_idx" ON "CognitiveTaskEvent"("taskSessionId", "occurredAt");
CREATE INDEX IF NOT EXISTS "CognitiveTaskEvent_eventType_idx" ON "CognitiveTaskEvent"("eventType");

DO $$ BEGIN
  ALTER TABLE "CognitiveTaskSession" ADD CONSTRAINT "CognitiveTaskSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CognitiveTaskSession" ADD CONSTRAINT "CognitiveTaskSession_homeworkTaskId_fkey" FOREIGN KEY ("homeworkTaskId") REFERENCES "HomeworkTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CognitiveTaskSession" ADD CONSTRAINT "CognitiveTaskSession_eegSessionId_fkey" FOREIGN KEY ("eegSessionId") REFERENCES "EegSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CognitiveTaskEvent" ADD CONSTRAINT "CognitiveTaskEvent_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "CognitiveTaskSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "HomeworkAttempt" ADD CONSTRAINT "HomeworkAttempt_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "CognitiveTaskSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
