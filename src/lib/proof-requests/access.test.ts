import { describe, expect, it } from "vitest";

import { canViewOwnedProofRequest } from "@/lib/proof-requests/access";

describe("canViewOwnedProofRequest", () => {
  it("allows the creator to view owned request details", () => {
    expect(canViewOwnedProofRequest("user-1", "user-1")).toBe(true);
  });

  it("does not allow another requester to view owned request details", () => {
    expect(canViewOwnedProofRequest("user-2", "user-1")).toBe(false);
  });

  it("does not treat anonymous visitors as owners", () => {
    expect(canViewOwnedProofRequest(null, "user-1")).toBe(false);
  });
});
