-- Product feedback (bugs / confusion / ideas). No IPs.
CREATE TABLE "ProductFeedback" (
    "id" TEXT NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "path" VARCHAR(512),
    "requestId" VARCHAR(64),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductFeedback_createdAt_idx" ON "ProductFeedback"("createdAt");
CREATE INDEX "ProductFeedback_category_createdAt_idx" ON "ProductFeedback"("category", "createdAt");

ALTER TABLE "ProductFeedback" ADD CONSTRAINT "ProductFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
