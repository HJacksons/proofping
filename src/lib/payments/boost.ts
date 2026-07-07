import { canAcceptReplies } from "@/lib/proof-requests/status";

export type UrgentBoostRequest = {
  creatorId: string;
  status: string;
  urgentBoostPaidAt: Date | null;
};

export function canPurchaseUrgentBoost(
  request: UrgentBoostRequest,
  viewerUserId: string,
) {
  if (request.creatorId !== viewerUserId) {
    return { ok: false as const, reason: "forbidden" };
  }

  if (!canAcceptReplies(request.status)) {
    return { ok: false as const, reason: "not-open" };
  }

  if (request.urgentBoostPaidAt) {
    return { ok: false as const, reason: "already-boosted" };
  }

  return { ok: true as const };
}

export function isCheckoutSessionUrgentBoost(metadata: Record<string, string>) {
  return metadata.kind === "urgent_boost";
}
