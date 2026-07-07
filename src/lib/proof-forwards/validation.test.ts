import { describe, expect, it } from "vitest";

import { canCreateProofForward } from "@/lib/proof-forwards/policy";
import { createProofForwardSchema } from "@/lib/proof-forwards/validation";

describe("createProofForwardSchema", () => {
  it("normalizes recipient email", () => {
    expect(
      createProofForwardSchema.parse({
        recipientEmail: " Helper@Example.com ",
        note: "  Can you check this today?  ",
      }),
    ).toEqual({
      recipientEmail: "helper@example.com",
      note: "Can you check this today?",
    });
  });

  it("rejects invalid recipient emails", () => {
    const result = createProofForwardSchema.safeParse({
      recipientEmail: "not-an-email",
    });

    expect(result.success).toBe(false);
  });
});

describe("canCreateProofForward", () => {
  it("allows forwarding under the request and daily limits", () => {
    expect(
      canCreateProofForward({
        requestForwardCount: 2,
        userForwardCountToday: 4,
      }),
    ).toEqual({ ok: true });
  });

  it("blocks forwarding after the per-request limit", () => {
    expect(
      canCreateProofForward({
        requestForwardCount: 3,
        userForwardCountToday: 1,
      }),
    ).toEqual({ ok: false, reason: "request-limit:3" });
  });

  it("blocks forwarding after the daily limit", () => {
    expect(
      canCreateProofForward({
        requestForwardCount: 1,
        userForwardCountToday: 10,
      }),
    ).toEqual({ ok: false, reason: "daily-limit:10" });
  });
});
