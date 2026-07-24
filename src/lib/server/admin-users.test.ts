import { describe, expect, it, vi } from "vitest";

const findManyUsers = vi.fn();
const findManyRequests = vi.fn();

vi.mock("@/lib/server/db", () => ({
  prisma: {
    user: {
      findMany: findManyUsers,
    },
    proofRequest: {
      findMany: findManyRequests,
    },
  },
}));

describe("getAdminUserPlaceOverview", () => {
  it("aggregates users and free-text places", async () => {
    findManyUsers.mockResolvedValue([
      {
        id: "u1",
        email: "a@example.com",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
        nearbyAlertsEnabled: true,
        nearbyAlertsLocation: "Campus library",
        _count: { proofRequests: 2 },
      },
      {
        id: "u2",
        email: "b@example.com",
        createdAt: new Date("2026-07-02T00:00:00.000Z"),
        nearbyAlertsEnabled: false,
        nearbyAlertsLocation: null,
        _count: { proofRequests: 0 },
      },
    ]);
    findManyRequests.mockResolvedValue([
      {
        locationHint: "Campus library",
        visibility: "LOCAL_DISCOVERY",
      },
      {
        locationHint: "Lagos market",
        visibility: "PRIVATE_LINK",
      },
    ]);

    const { getAdminUserPlaceOverview } = await import(
      "@/lib/server/admin-users"
    );
    const overview = await getAdminUserPlaceOverview();

    expect(overview.totals.users).toBe(2);
    expect(overview.totals.alertsEnabled).toBe(1);
    expect(overview.users[0]?.email).toBe("a@example.com");
    expect(overview.places[0]).toMatchObject({
      place: "Campus library",
      usersWatching: 1,
      asks: 1,
      nearbyAsks: 1,
    });
    expect(overview.note.toLowerCase()).toContain("free-text");
  });
});
