-- CreateEnum
CREATE TYPE "EvidenceOwnerKind" AS ENUM ('REQUEST', 'REPLY');

-- CreateTable
CREATE TABLE "RequestEvidence" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "replyId" TEXT,
    "ownerKind" "EvidenceOwnerKind" NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(64) NOT NULL,
    "originalName" VARCHAR(160) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestEvidence_storageKey_key" ON "RequestEvidence"("storageKey");

-- CreateIndex
CREATE INDEX "RequestEvidence_requestId_createdAt_idx" ON "RequestEvidence"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "RequestEvidence_replyId_createdAt_idx" ON "RequestEvidence"("replyId", "createdAt");

-- AddForeignKey
ALTER TABLE "RequestEvidence" ADD CONSTRAINT "RequestEvidence_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProofRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestEvidence" ADD CONSTRAINT "RequestEvidence_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ProofReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
