-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliateId" TEXT,
ADD COLUMN     "collegeName" TEXT NOT NULL DEFAULT 'SRKR Engineering College',
ADD COLUMN     "isCodingClubAffiliate" BOOLEAN NOT NULL DEFAULT false;
