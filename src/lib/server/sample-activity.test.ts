import { beforeEach, describe, expect, it, vi } from "vitest";

const upsert = vi.fn();
const deleteManyReply = vi.fn();
const deleteManyRequest = vi.fn();
const createRequest = vi.fn();
const createReply = vi.fn();

vi.mock("@/lib/server/db", () => ({
  prisma: {
    user: { upsert },
    proofReply: { deleteMany: deleteManyReply, create: createReply },
    proofRequest: { deleteMany: deleteManyRequest, create: createRequest },
  },
}));

describe("seedSampleActivity", () => {
  beforeEach(() => {
    vi.resetModules();
    upsert.mockReset();
    deleteManyReply.mockReset();
    deleteManyRequest.mockReset();
    createRequest.mockReset();
    createReply.mockReset();
  });

  it("replaces prior seed asks and creates nearby samples with proofs", async () => {
    upsert.mockResolvedValue({ id: "seed-user" });
    deleteManyReply.mockResolvedValue({ count: 0 });
    deleteManyRequest.mockResolvedValue({ count: 0 });
    createRequest.mockResolvedValue({ id: "ask-1" });
    createReply.mockResolvedValue({ id: "reply-1" });

    const { seedSampleActivity, SAMPLE_SEED_EMAIL } = await import(
      "@/lib/server/sample-activity"
    );
    const result = await seedSampleActivity();

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: SAMPLE_SEED_EMAIL },
      }),
    );
    expect(deleteManyRequest).toHaveBeenCalled();
    expect(createRequest).toHaveBeenCalled();
    expect(createReply).toHaveBeenCalled();
    expect(result.asks).toBeGreaterThanOrEqual(6);
    expect(result.proofs).toBeGreaterThanOrEqual(5);

    const locations = createRequest.mock.calls.map(
      (call) => call[0].data.locationHint as string,
    );
    expect(locations.some((place) => /uganda/i.test(place))).toBe(false);
    expect(locations.some((place) => /OsloMet/i.test(place))).toBe(true);
    expect(locations.some((place) => /NYU|Berkeley|London|Denver|MIT|Stanford|Columbia/i.test(place))).toBe(
      true,
    );
  });
});
