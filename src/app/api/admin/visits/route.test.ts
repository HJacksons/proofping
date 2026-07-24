import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const getSiteVisitStats = vi.fn();

vi.mock("@/lib/server/admin", () => ({
  requireAdminUser,
}));

vi.mock("@/lib/server/site-visits", () => ({
  getSiteVisitStats,
}));

describe("GET /api/admin/visits", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdminUser.mockReset();
    getSiteVisitStats.mockReset();
  });

  it("returns 403 when the user is not an admin", async () => {
    const { AdminRequiredError } = await import("@/lib/server/admin-errors");
    requireAdminUser.mockRejectedValue(new AdminRequiredError());

    const { GET } = await import("@/app/api/admin/visits/route");
    const response = await GET(
      new Request("http://localhost:3000/api/admin/visits"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Admin access is required.",
    });
    expect(getSiteVisitStats).not.toHaveBeenCalled();
  });

  it("returns 401 when the user is not signed in", async () => {
    const { AuthRequiredError } = await import("@/lib/server/auth");
    requireAdminUser.mockRejectedValue(new AuthRequiredError());

    const { GET } = await import("@/app/api/admin/visits/route");
    const response = await GET(
      new Request("http://localhost:3000/api/admin/visits"),
    );

    expect(response.status).toBe(401);
    expect(getSiteVisitStats).not.toHaveBeenCalled();
  });

  it("returns stats for an admin", async () => {
    requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      isAdultVerified: true,
    });
    getSiteVisitStats.mockResolvedValue({
      days: 14,
      totalViews: 2,
      uniqueVisitors: 1,
      humanViews: 2,
      botViews: 0,
      topPaths: [{ path: "/", views: 2 }],
      topCountries: [
        {
          countryCode: "US",
          countryName: "United States",
          views: 2,
          uniqueVisitors: 1,
        },
      ],
      viewsByDay: [],
      recent: [],
      note: "Country is estimated from the connection.",
    });

    const { GET } = await import("@/app/api/admin/visits/route");
    const response = await GET(
      new Request("http://localhost:3000/api/admin/visits?days=14"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      stats: {
        days: 14,
        totalViews: 2,
        uniqueVisitors: 1,
        humanViews: 2,
        botViews: 0,
        topPaths: [{ path: "/", views: 2 }],
        topCountries: [
          {
            countryCode: "US",
            countryName: "United States",
            views: 2,
            uniqueVisitors: 1,
          },
        ],
        viewsByDay: [],
        recent: [],
        note: "Country is estimated from the connection.",
      },
    });
    expect(getSiteVisitStats).toHaveBeenCalledWith(14);
  });
});
