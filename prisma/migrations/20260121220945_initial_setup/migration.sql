-- CreateEnum
CREATE TYPE "YearOfStudy" AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR');

-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CSE', 'CSBS', 'CSD', 'CSIT', 'IT', 'AI_DS', 'AI_ML', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'BIO', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "yearOfStudy" "YearOfStudy" NOT NULL,
    "branch" "Branch" NOT NULL,
    "gender" "Gender" NOT NULL,
    "codechefHandle" TEXT,
    "leetcodeHandle" TEXT,
    "codeforcesHandle" TEXT,
    "transactionId" TEXT NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationCode_key" ON "User"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationNumber_key" ON "User"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_transactionId_key" ON "User"("transactionId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_registrationNumber_idx" ON "User"("registrationNumber");

-- CreateIndex
CREATE INDEX "User_transactionId_idx" ON "User"("transactionId");

-- CreateIndex
CREATE INDEX "User_paymentStatus_idx" ON "User"("paymentStatus");
