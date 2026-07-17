-- Privacy-safe site page views for admin visitor stats
CREATE TABLE "SitePageView" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(512) NOT NULL,
    "referrerHost" VARCHAR(255),
    "visitorKeyHash" VARCHAR(64) NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SitePageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SitePageView_createdAt_idx" ON "SitePageView"("createdAt");
CREATE INDEX "SitePageView_path_createdAt_idx" ON "SitePageView"("path", "createdAt");
CREATE INDEX "SitePageView_visitorKeyHash_createdAt_idx" ON "SitePageView"("visitorKeyHash", "createdAt");
