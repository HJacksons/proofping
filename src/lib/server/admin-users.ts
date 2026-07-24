import "server-only";

import { prisma } from "@/lib/server/db";

const MAX_USERS = 500;
const MAX_ASK_PLACES = 2_000;

export type AdminUserRow = {
  id: string;
  email: string;
  createdAt: string;
  nearbyAlertsEnabled: boolean;
  nearbyAlertsLocation: string | null;
  askCount: number;
};

export type AdminPlaceCount = {
  place: string;
  usersWatching: number;
  asks: number;
  nearbyAsks: number;
};

function normalizePlace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function placeKey(value: string) {
  return normalizePlace(value).toLowerCase();
}

export async function getAdminUserPlaceOverview() {
  const [users, asks] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        nearbyAlertsEnabled: true,
        nearbyAlertsLocation: true,
        _count: {
          select: {
            proofRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: MAX_USERS,
    }),
    prisma.proofRequest.findMany({
      where: {
        locationHint: {
          not: null,
        },
      },
      select: {
        locationHint: true,
        visibility: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: MAX_ASK_PLACES,
    }),
  ]);

  const placeMap = new Map<
    string,
    { place: string; usersWatching: number; asks: number; nearbyAsks: number }
  >();

  function bump(
    raw: string | null | undefined,
    field: "usersWatching" | "asks" | "nearbyAsks",
  ) {
    if (!raw?.trim()) {
      return;
    }

    const place = normalizePlace(raw);
    const key = placeKey(place);
    const existing = placeMap.get(key) ?? {
      place,
      usersWatching: 0,
      asks: 0,
      nearbyAsks: 0,
    };
    existing[field] += 1;
    placeMap.set(key, existing);
  }

  for (const user of users) {
    if (user.nearbyAlertsEnabled) {
      bump(user.nearbyAlertsLocation, "usersWatching");
    }
  }

  for (const ask of asks) {
    bump(ask.locationHint, "asks");
    if (ask.visibility === "LOCAL_DISCOVERY") {
      bump(ask.locationHint, "nearbyAsks");
    }
  }

  const places: AdminPlaceCount[] = [...placeMap.values()].sort((a, b) => {
    const scoreA = a.usersWatching * 3 + a.nearbyAsks * 2 + a.asks;
    const scoreB = b.usersWatching * 3 + b.nearbyAsks * 2 + b.asks;
    return scoreB - scoreA || a.place.localeCompare(b.place);
  });

  const userRows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    nearbyAlertsEnabled: user.nearbyAlertsEnabled,
    nearbyAlertsLocation: user.nearbyAlertsLocation,
    askCount: user._count.proofRequests,
  }));

  return {
    totals: {
      users: userRows.length,
      usersTruncated: users.length >= MAX_USERS,
      alertsEnabled: userRows.filter((user) => user.nearbyAlertsEnabled).length,
      places: places.length,
      asksWithPlace: asks.length,
      asksTruncated: asks.length >= MAX_ASK_PLACES,
    },
    users: userRows,
    places,
    note: "Free-text place labels from asks and alert prefs (campus, market, city). Not GPS or verified country codes.",
  };
}
