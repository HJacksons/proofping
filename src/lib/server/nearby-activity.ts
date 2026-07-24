import "server-only";

import { prisma } from "@/lib/server/db";

const LOOKING_WINDOW_MS = 15 * 60 * 1000;
const PROOF_WINDOW_MS = 60 * 60 * 1000;

export type NearbyActivityPulse = {
  openAsks: number;
  lookingNow: number;
  proofsLastHour: number;
  watchers: number;
  placeLabel: string | null;
};

function locationFilter(location: string | null | undefined) {
  const trimmed = location?.trim();
  if (!trimmed) {
    return null;
  }

  return {
    contains: trimmed,
    mode: "insensitive" as const,
  };
}

export async function getNearbyActivityPulse(
  location?: string | null,
): Promise<NearbyActivityPulse> {
  const placeFilter = locationFilter(location);
  const lookingSince = new Date(Date.now() - LOOKING_WINDOW_MS);
  const proofSince = new Date(Date.now() - PROOF_WINDOW_MS);

  const [openAsks, recentViews, proofsLastHour, watchers] = await Promise.all([
    prisma.proofRequest.count({
      where: {
        visibility: "LOCAL_DISCOVERY",
        status: {
          in: ["OPEN", "UNRESOLVED", "SUSPICIOUS"],
        },
        ...(placeFilter ? { locationHint: placeFilter } : {}),
      },
    }),
    prisma.sitePageView.findMany({
      where: {
        createdAt: { gte: lookingSince },
        isBot: false,
        path: {
          startsWith: "/requests",
        },
      },
      select: {
        visitorKeyHash: true,
      },
      take: 2_000,
    }),
    prisma.proofReply.count({
      where: {
        createdAt: { gte: proofSince },
        proofRequest: {
          visibility: "LOCAL_DISCOVERY",
          ...(placeFilter ? { locationHint: placeFilter } : {}),
        },
      },
    }),
    placeFilter
      ? prisma.user.count({
          where: {
            nearbyAlertsEnabled: true,
            nearbyAlertsLocation: placeFilter,
          },
        })
      : prisma.user.count({
          where: {
            nearbyAlertsEnabled: true,
            nearbyAlertsLocation: { not: null },
          },
        }),
  ]);

  const lookingNow = new Set(recentViews.map((view) => view.visitorKeyHash))
    .size;

  return {
    openAsks,
    lookingNow,
    proofsLastHour,
    watchers,
    placeLabel: location?.trim() || null,
  };
}
