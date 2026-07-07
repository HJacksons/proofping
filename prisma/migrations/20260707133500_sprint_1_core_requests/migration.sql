-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProofRequestStatus" AS ENUM ('OPEN', 'SOLVED', 'SUSPICIOUS', 'UNRESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProofRequestVisibility" AS ENUM ('PRIVATE_LINK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'REQUESTER',
    "isAdultVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofRequest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "locationHint" VARCHAR(160),
    "status" "ProofRequestStatus" NOT NULL DEFAULT 'OPEN',
    "visibility" "ProofRequestVisibility" NOT NULL DEFAULT 'PRIVATE_LINK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ProofRequest_creatorId_createdAt_idx" ON "ProofRequest"("creatorId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProofRequest" ADD CONSTRAINT "ProofRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
