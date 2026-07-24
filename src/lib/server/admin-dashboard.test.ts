import { afterEach, describe, expect, it, vi } from "vitest";

const proofRequestCount = vi.fn();
const proofReplyCount = vi.fn();
const userCount = vi.fn();
const paymentFindMany = vi.fn();
const proofRequestFindMany = vi.fn();
const getAdminUserPlaceOverview = vi.fn();
const getSiteVisitStats = vi.fn();

vi.mock("@/lib/server/db", () => ({
  prisma: {
    proofRequest: {
      count: (...args: unknown[]) => proofRequestCount(...args),
      findMany: (...args: unknown[]) => proofRequestFindMany(...args),
    },
    proofReply: {
      count: (...args: unknown[]) => proofReplyCount(...args),
    },
    user: {
      count: (...args: unknown[]) => userCount(...args),
    },
    payment: {
      findMany: (...args: unknown[]) => paymentFindMany(...args),
    },
  },
}));

vi.mock("@/lib/server/admin-users", () => ({
  getAdminUserPlaceOverview,
}));

vi.mock("@/lib/server/site-visits", () => ({
  getSiteVisitStats,
}));

describe("getAdminDashboard", () => {
  afterEach(() => {
    vi.resetModules();
    proofRequestCount.mockReset();
    proofReplyCount.mockReset();
    userCount.mockReset();
    paymentFindMany.mockReset();
    proofRequestFindMany.mockReset();
    getAdminUserPlaceOverview.mockReset();
    getSiteVisitStats.mockReset();
  });

  it("aggregates live counts and payment totals", async () => {
    getAdminUserPlaceOverview.mockResolvedValue({
      totals: {
        users: 12,
        usersTruncated: false,
        alertsEnabled: 4,
        places: 3,
        asksWithPlace: 8,
        asksTruncated: false,
      },
      users: [],
      places: [
        {
          place: "Campus library",
          usersWatching: 2,
          asks: 5,
          nearbyAsks: 3,
        },
      ],
      note: "Places are free-text.",
    });
    getSiteVisitStats.mockResolvedValue({
      days: 14,
      totalViews: 40,
      uniqueVisitors: 9,
      humanViews: 35,
      botViews: 5,
      topPaths: [{ path: "/requests", views: 20 }],
      topCountries: [
        {
          countryCode: "NG",
          countryName: "Nigeria",
          views: 12,
          uniqueVisitors: 4,
        },
      ],
      viewsByDay: [{ date: "2026-07-17", views: 4, uniqueVisitors: 2 }],
      recent: [],
      note: "Country is estimated from the connection.",
    });

    proofRequestCount.mockImplementation(
      (args: { where?: { status?: string; visibility?: string; createdAt?: unknown } }) => {
        if (args.where?.visibility === "LOCAL_DISCOVERY") {
          return Promise.resolve(5);
        }
        if (args.where?.createdAt) {
          return Promise.resolve(6);
        }
        return Promise.resolve(7);
      },
    );
    proofReplyCount.mockResolvedValue(11);
    userCount.mockResolvedValue(2);
    paymentFindMany.mockResolvedValue([
      { amountCents: 500, currency: "usd" },
      { amountCents: 300, currency: "usd" },
    ]);
    proofRequestFindMany.mockResolvedValue([
      {
        id: "ask-1",
        title: "Is the printer working?",
        locationHint: "Campus library",
        visibility: "LOCAL_DISCOVERY",
        createdAt: new Date("2026-07-17T10:00:00.000Z"),
        creator: { email: "a@example.test" },
        _count: { replies: 1 },
      },
    ]);

    const { getAdminDashboard } = await import(
      "@/lib/server/admin-dashboard"
    );
    const dashboard = await getAdminDashboard();

    expect(dashboard.metrics).toMatchObject({
      users: 12,
      alertsEnabled: 4,
      openAsks: 7,
      nearbyOpenAsks: 5,
      repliesLast7d: 11,
      asksLast7d: 6,
      newUsersLast7d: 2,
      humanViewsLast14d: 35,
      uniqueVisitorsLast14d: 9,
      paidCents: 800,
      paidCurrency: "usd",
      paidCount: 2,
    });
    expect(dashboard.topPlaces[0]?.place).toBe("Campus library");
    expect(dashboard.topCountries[0]?.countryCode).toBe("NG");
    expect(dashboard.recentOpenAsks[0]?.title).toBe("Is the printer working?");
  });
});
