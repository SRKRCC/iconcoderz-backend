-- AlterTable
ALTER TABLE "User" ADD COLUMN     "attended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attendedAt" TIMESTAMP(3),
ADD COLUMN     "attendedBy" TEXT,
ADD COLUMN     "checkInCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceLog_registrationId_idx" ON "AttendanceLog"("registrationId");

-- CreateIndex
CREATE INDEX "AttendanceLog_adminId_idx" ON "AttendanceLog"("adminId");

-- CreateIndex
CREATE INDEX "AttendanceLog_scannedAt_idx" ON "AttendanceLog"("scannedAt");

-- CreateIndex
CREATE INDEX "User_attended_idx" ON "User"("attended");

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
