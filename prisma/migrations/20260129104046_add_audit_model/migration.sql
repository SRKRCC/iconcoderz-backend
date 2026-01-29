-- CreateEnum
CREATE TYPE "AuditEvent" AS ENUM ('REGISTRATION_STARTED', 'REGISTRATION_SUCCESS', 'REGISTRATION_FAILED', 'EMAIL_QUEUED', 'EMAIL_SENT', 'EMAIL_FAILED');

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "event" "AuditEvent" NOT NULL,
    "payload" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_event_idx" ON "Audit"("event");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- CreateIndex
CREATE INDEX "Audit_createdAt_idx" ON "Audit"("createdAt");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
