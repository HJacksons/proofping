-- Opt-in nearby ask alerts for helpers
ALTER TABLE "User" ADD COLUMN "nearbyAlertsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "nearbyAlertsLocation" VARCHAR(160);

CREATE INDEX "User_nearbyAlertsEnabled_nearbyAlertsLocation_idx" ON "User"("nearbyAlertsEnabled", "nearbyAlertsLocation");
