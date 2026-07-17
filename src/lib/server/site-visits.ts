import "server-only";

import { cookies } from "next/headers";

import { generateSecureToken, hashToken } from "@/lib/auth/crypto";
import { prisma } from "@/lib/server/db";

export const VISITOR_COOKIE_NAME = "pp_vid";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|wget|curl|python-requests|headless/i;

export type SiteVisitInput = {
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
};

export type SiteVisitStatsDTO = {
  days: number;
  totalViews: number;
  uniqueVisitors: number;
  humanViews: number;
  botViews: number;
  topPaths: Array<{ path: string; views: number }>;
  viewsByDay: Array<{ date: string; views: number; uniqueVisitors: number }>;
  recent: Array<{
    id: string;
    path: string;
    referrerHost: string | null;
    isBot: boolean;
    createdAt: string;
  }>;
};

export function extractReferrerHost(referrer: string | null | undefined) {
  if (!referrer) {
    return null;
  }

  try {
    const url = new URL(referrer);
    return url.hostname.slice(0, 255) || null;
  } catch {
    return null;
  }
}

export function isBotUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) {
    return false;
  }

  return BOT_UA_PATTERN.test(userAgent);
}

export async function resolveVisitorKeyHash() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

  if (existing && existing.length >= 16 && existing.length <= 128) {
    return {
      visitorKeyHash: hashToken(existing),
      setCookieValue: null as string | null,
    };
  }

  const token = generateSecureToken();
  return {
    visitorKeyHash: hashToken(token),
    setCookieValue: token,
  };
}

export function visitorCookieOptions(token: string) {
  return {
    name: VISITOR_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function recordSiteVisit(input: SiteVisitInput) {
  const { visitorKeyHash, setCookieValue } = await resolveVisitorKeyHash();
  const isBot = isBotUserAgent(input.userAgent);

  await prisma.sitePageView.create({
    data: {
      path: input.path.slice(0, 512),
      referrerHost: extractReferrerHost(input.referrer),
      visitorKeyHash,
      isBot,
    },
  });

  if (setCookieValue) {
    const cookieStore = await cookies();
    const options = visitorCookieOptions(setCookieValue);
    cookieStore.set(options.name, options.value, {
      httpOnly: options.httpOnly,
      sameSite: options.sameSite,
      secure: options.secure,
      path: options.path,
      maxAge: options.maxAge,
    });
  }

  return { ok: true as const };
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getSiteVisitStats(days = 14): Promise<SiteVisitStatsDTO> {
  const since = startOfUtcDay(new Date());
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const views = await prisma.sitePageView.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      path: true,
      referrerHost: true,
      visitorKeyHash: true,
      isBot: true,
      createdAt: true,
    },
  });

  const pathCounts = new Map<string, number>();
  const uniqueVisitors = new Set<string>();
  const dayBuckets = new Map<
    string,
    { views: number; visitors: Set<string> }
  >();

  let humanViews = 0;
  let botViews = 0;

  for (const view of views) {
    pathCounts.set(view.path, (pathCounts.get(view.path) ?? 0) + 1);
    uniqueVisitors.add(view.visitorKeyHash);

    if (view.isBot) {
      botViews += 1;
    } else {
      humanViews += 1;
    }

    const dayKey = toDateKey(view.createdAt);
    const bucket = dayBuckets.get(dayKey) ?? {
      views: 0,
      visitors: new Set<string>(),
    };
    bucket.views += 1;
    bucket.visitors.add(view.visitorKeyHash);
    dayBuckets.set(dayKey, bucket);
  }

  const viewsByDay: SiteVisitStatsDTO["viewsByDay"] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + offset);
    const key = toDateKey(day);
    const bucket = dayBuckets.get(key);
    viewsByDay.push({
      date: key,
      views: bucket?.views ?? 0,
      uniqueVisitors: bucket?.visitors.size ?? 0,
    });
  }

  const topPaths = [...pathCounts.entries()]
    .map(([path, count]) => ({ path, views: count }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, 20);

  return {
    days,
    totalViews: views.length,
    uniqueVisitors: uniqueVisitors.size,
    humanViews,
    botViews,
    topPaths,
    viewsByDay,
    recent: views.slice(0, 50).map((view) => ({
      id: view.id,
      path: view.path,
      referrerHost: view.referrerHost,
      isBot: view.isBot,
      createdAt: view.createdAt.toISOString(),
    })),
  };
}
