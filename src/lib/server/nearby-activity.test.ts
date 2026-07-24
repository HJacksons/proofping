import { describe, expect, it, vi } from "vitest";

const count = vi.fn();
const findMany = vi.fn();

vi.mock("@/lib/server/db", () => ({
  prisma: {
    proofRequest: { count },
    sitePageView: { findMany },
    proofReply: { count },
    user: { count },
  },
}));

describe("getNearbyActivityPulse", () => {
  it("returns honest activity counts", async () => {
    count
      .mockResolvedValueOnce(4) // open asks
      .mockResolvedValueOnce(2) // proofs
      .mockResolvedValueOnce(3); // watchers
    findMany.mockResolvedValue([
      { visitorKeyHash: "a" },
      { visitorKeyHash: "a" },
      { visitorKeyHash: "b" },
    ]);

    const { getNearbyActivityPulse } = await import(
      "@/lib/server/nearby-activity"
    );
    const pulse = await getNearbyActivityPulse("Makerere");

    expect(pulse).toEqual({
      openAsks: 4,
      lookingNow: 2,
      proofsLastHour: 2,
      watchers: 3,
      placeLabel: "Makerere",
    });
  });
});
