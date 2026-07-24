import { describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const updateMany = vi.fn();

vi.mock("@/lib/server/db", () => ({
  prisma: {
    proofRequest: {
      findMany,
      updateMany,
    },
  },
}));

describe("admin asks", () => {
  it("lists open asks", async () => {
    findMany.mockResolvedValue([
      {
        id: "ask-1",
        title: "Is the printer working?",
        locationHint: "Campus library",
        visibility: "LOCAL_DISCOVERY",
        createdAt: new Date("2026-07-24T10:00:00.000Z"),
        creator: { email: "you@example.com" },
      },
    ]);

    const { listAdminOpenAsks } = await import("@/lib/server/admin-asks");
    const overview = await listAdminOpenAsks();

    expect(overview.asks).toHaveLength(1);
    expect(overview.asks[0]?.creatorEmail).toBe("you@example.com");
  });

  it("closes an open ask", async () => {
    updateMany.mockResolvedValue({ count: 1 });
    const { closeAdminProofRequest } = await import("@/lib/server/admin-asks");
    await expect(closeAdminProofRequest("ask-1")).resolves.toEqual({
      closed: true,
    });
  });
});
