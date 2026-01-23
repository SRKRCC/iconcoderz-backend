-- AlterTable
ALTER TABLE "User" ADD COLUMN     "searchVector" tsvector;

-- CreateIndex
CREATE INDEX "User_branch_idx" ON "User"("branch");

-- CreateIndex
CREATE INDEX "User_yearOfStudy_idx" ON "User"("yearOfStudy");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_branch_yearOfStudy_paymentStatus_idx" ON "User"("branch", "yearOfStudy", "paymentStatus");
