import "server-only";

import { prisma } from "@/lib/server/db";
import { getAdminUserPlaceOverview } from "@/lib/server/admin-users";
import { getSiteVisitStats } from "@/lib/server/site-visits";

const RECENT_ASKS = 8;
const TOP_PLACES = 8;

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function daysAgo(days: number) {
  const since = startOfUtcDay(new Date());
  since.setUTCDate(since.getUTCDate() - (days - 1));
  return since;
}

export type AdminDashboardDTO = {
  generatedAt: string;
  metrics: {
    users: number;
    alertsEnabled: number;
    openAsks: number;
    nearbyOpenAsks: number;
    repliesLast7d: number;
    asksLast7d: number;
    newUsersLast7d: number;
    humanViewsLast14d: number;
    uniqueVisitorsLast14d: number;
    paidCents: number;
    paidCurrency: string | null;
    paidCount: number;
  };
  visitTrend: Array<{ date: string; views: number; uniqueVisitors: number }>;
  topPaths: Array<{ path: string; views: number }>;
  topCountries: Array<{
    countryCode: string;
    countryName: string;
    views: number;
    uniqueVisitors: number;
  }>;
  visitsNote: string;
  topPlaces: Array<{
    place: string;
    usersWatching: number;
    asks: number;
    nearbyAsks: number;
  }>;
  recentOpenAsks: Array<{
    id: string;
    title: string;
    locationHint: string | null;
    visibility: string;
    createdAt: string;
    creatorEmail: string;
    replyCount: number;
  }>;
  placesNote: string;
};

export async function getAdminDashboard(): Promise<AdminDashboardDTO> {
  const since7d = daysAgo(7);

  const [
    overview,
    visits,
    openAsks,
    nearbyOpenAsks,
    repliesLast7d,
    asksLast7d,
    newUsersLast7d,
    paidPayments,
    recentAsks,
  ] = await Promise.all([
    getAdminUserPlaceOverview(),
    getSiteVisitStats(14),
    prisma.proofRequest.count({ where: { status: "OPEN" } }),
    prisma.proofRequest.count({
      where: { status: "OPEN", visibility: "LOCAL_DISCOVERY" },
    }),
    prisma.proofReply.count({
      where: { createdAt: { gte: since7d } },
    }),
    prisma.proofRequest.count({
      where: { createdAt: { gte: since7d } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: since7d } },
    }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      select: {
        amountCents: true,
        currency: true,
      },
      take: 2_000,
    }),
    prisma.proofRequest.findMany({
      where: { status: "OPEN" },
      select: {
        id: true,
        title: true,
        locationHint: true,
        visibility: true,
        createdAt: true,
        creator: { select: { email: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: RECENT_ASKS,
    }),
  ]);

  let paidCents = 0;
  let paidCurrency: string | null = null;
  for (const payment of paidPayments) {
    if (typeof payment.amountCents === "number") {
      paidCents += payment.amountCents;
    }
    if (!paidCurrency && payment.currency) {
      paidCurrency = payment.currency;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      users: overview.totals.users,
      alertsEnabled: overview.totals.alertsEnabled,
      openAsks,
      nearbyOpenAsks,
      repliesLast7d,
      asksLast7d,
      newUsersLast7d,
      humanViewsLast14d: visits.humanViews,
      uniqueVisitorsLast14d: visits.uniqueVisitors,
      paidCents,
      paidCurrency,
      paidCount: paidPayments.length,
    },
    visitTrend: visits.viewsByDay,
    topPaths: visits.topPaths.slice(0, 6),
    topCountries: visits.topCountries.slice(0, 8),
    visitsNote: visits.note,
    topPlaces: overview.places.slice(0, TOP_PLACES),
    recentOpenAsks: recentAsks.map((ask) => ({
      id: ask.id,
      title: ask.title,
      locationHint: ask.locationHint,
      visibility: ask.visibility,
      createdAt: ask.createdAt.toISOString(),
      creatorEmail: ask.creator.email,
      replyCount: ask._count.replies,
    })),
    placesNote: overview.note,
  };
}
