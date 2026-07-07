import "server-only";

import { canPurchaseUrgentBoost } from "@/lib/payments/boost";
import { UrgentBoostNotAllowedError } from "@/lib/payments/errors";
import { ProofRequestForbiddenError } from "@/lib/proof-requests/errors";
import { prisma } from "@/lib/server/db";

export async function fulfillUrgentBoostPayment(requestId: string, userId: string) {
  const request = await prisma.proofRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      creatorId: true,
      urgentBoostPaidAt: true,
    },
  });

  if (!request) {
    throw new UrgentBoostNotAllowedError("Proof request not found.");
  }

  if (request.creatorId !== userId) {
    throw new ProofRequestForbiddenError();
  }

  if (request.urgentBoostPaidAt) {
    return request;
  }

  return prisma.proofRequest.update({
    where: {
      id: requestId,
    },
    data: {
      urgentBoostPaidAt: new Date(),
    },
    select: {
      creatorId: true,
      urgentBoostPaidAt: true,
    },
  });
}

export async function startUrgentBoostCheckoutForRequest(
  requestId: string,
  userId: string,
) {
  const request = await prisma.proofRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      title: true,
      creatorId: true,
      status: true,
      urgentBoostPaidAt: true,
    },
  });

  if (!request) {
    return null;
  }

  const policy = canPurchaseUrgentBoost(request, userId);

  if (!policy.ok) {
    if (policy.reason === "forbidden") {
      throw new ProofRequestForbiddenError();
    }

    if (policy.reason === "already-boosted") {
      throw new UrgentBoostNotAllowedError("This request is already boosted.");
    }

    throw new UrgentBoostNotAllowedError();
  }

  const { createUrgentBoostCheckoutSession } = await import("@/lib/server/stripe");

  return createUrgentBoostCheckoutSession({
    userId,
    requestId: request.id,
    requestTitle: request.title,
  });
}
