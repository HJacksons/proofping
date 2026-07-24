import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/admin", () => ({
  requireAdminUser: vi.fn(),
}));

vi.mock("@/lib/server/admin-users", () => ({
  getAdminUserPlaceOverview: vi.fn(),
}));

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when the user is not an admin", async () => {
    const { AdminRequiredError } = await import("@/lib/server/admin-errors");
    const { requireAdminUser } = await import("@/lib/server/admin");
    vi.mocked(requireAdminUser).mockRejectedValue(new AdminRequiredError());

    const { GET } = await import("@/app/api/admin/users/route");
    const response = await GET();

    expect(response.status).toBe(403);
  });

  it("returns overview for an admin", async () => {
    const { requireAdminUser } = await import("@/lib/server/admin");
    const { getAdminUserPlaceOverview } = await import(
      "@/lib/server/admin-users"
    );

    vi.mocked(requireAdminUser).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      isAdultVerified: true,
    });
    vi.mocked(getAdminUserPlaceOverview).mockResolvedValue({
      totals: {
        users: 1,
        usersTruncated: false,
        alertsEnabled: 1,
        places: 1,
        asksWithPlace: 1,
        asksTruncated: false,
      },
      users: [
        {
          id: "u1",
          email: "helper@example.com",
          createdAt: "2026-07-01T00:00:00.000Z",
          nearbyAlertsEnabled: true,
          nearbyAlertsLocation: "Campus library",
          askCount: 2,
        },
      ],
      places: [
        {
          place: "Campus library",
          usersWatching: 1,
          asks: 1,
          nearbyAsks: 1,
        },
      ],
      note: "Places are free-text hints.",
    });

    const { GET } = await import("@/app/api/admin/users/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.overview.totals.users).toBe(1);
    expect(payload.overview.places[0].place).toBe("Campus library");
  });
});
