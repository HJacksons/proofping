-- CreateEnum
CREATE TYPE "ProofReplyVerdict" AS ENUM ('CONFIRMED', 'SUSPICIOUS', 'UNSURE');

-- CreateTable
CREATE TABLE "ProofReply" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "helperName" VARCHAR(80),
    "body" TEXT NOT NULL,
    "verdict" "ProofReplyVerdict" NOT NULL DEFAULT 'UNSURE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProofReply_requestId_createdAt_idx" ON "ProofReply"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProofReply" ADD CONSTRAINT "ProofReply_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProofRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
