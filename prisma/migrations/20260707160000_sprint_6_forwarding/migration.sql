-- CreateEnum
CREATE TYPE "ProofForwardStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ProofRequestForward" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientEmail" VARCHAR(320) NOT NULL,
    "note" VARCHAR(500),
    "helperLinkUrl" VARCHAR(2048) NOT NULL,
    "status" "ProofForwardStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofRequestForward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProofRequestForward_requestId_createdAt_idx" ON "ProofRequestForward"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "ProofRequestForward_senderId_createdAt_idx" ON "ProofRequestForward"("senderId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProofRequestForward" ADD CONSTRAINT "ProofRequestForward_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProofRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofRequestForward" ADD CONSTRAINT "ProofRequestForward_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
