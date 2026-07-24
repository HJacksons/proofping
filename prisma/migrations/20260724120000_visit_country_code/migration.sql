-- Coarse country from connection (ISO 3166-1 alpha-2). No IPs stored.
ALTER TABLE "SitePageView" ADD COLUMN "countryCode" VARCHAR(2);

CREATE INDEX "SitePageView_countryCode_createdAt_idx" ON "SitePageView"("countryCode", "createdAt");
