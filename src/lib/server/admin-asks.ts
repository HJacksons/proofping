import "server-only";

import { prisma } from "@/lib/server/db";

const MAX_OPEN_ASKS = 100;

export type AdminOpenAsk = {
  id: string;
  title: string;
  locationHint: string | null;
  visibility: string;
  createdAt: string;
  creatorEmail: string;
};

export async function listAdminOpenAsks() {
  const asks = await prisma.proofRequest.findMany({
    where: {
      status: "OPEN",
    },
    select: {
      id: true,
      title: true,
      locationHint: true,
      visibility: true,
      createdAt: true,
      creator: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: MAX_OPEN_ASKS,
  });

  return {
    asks: asks.map(
      (ask): AdminOpenAsk => ({
        id: ask.id,
        title: ask.title,
        locationHint: ask.locationHint,
        visibility: ask.visibility,
        createdAt: ask.createdAt.toISOString(),
        creatorEmail: ask.creator.email,
      }),
    ),
    truncated: asks.length >= MAX_OPEN_ASKS,
  };
}

export async function closeAdminProofRequest(requestId: string) {
  const updated = await prisma.proofRequest.updateMany({
    where: {
      id: requestId,
      status: "OPEN",
    },
    data: {
      status: "CLOSED",
    },
  });

  return { closed: updated.count > 0 };
}
