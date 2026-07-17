-- Local discovery feed for opt-in public help requests
ALTER TYPE "ProofRequestVisibility" ADD VALUE 'LOCAL_DISCOVERY';

CREATE INDEX "ProofRequest_visibility_locationHint_createdAt_idx"
ON "ProofRequest"("visibility", "locationHint", "createdAt");
