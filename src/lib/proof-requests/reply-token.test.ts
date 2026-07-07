import { describe, expect, it } from "vitest";

import {
  createReplyCapabilityToken,
  verifyReplyCapabilityToken,
} from "@/lib/proof-requests/reply-token";

describe("reply capability tokens", () => {
  it("creates and verifies a signed helper reply token", () => {
    const requestId = "request-123";
    const token = createReplyCapabilityToken(requestId);

    expect(verifyReplyCapabilityToken(requestId, token)).toBe(true);
  });

  it("rejects tokens for another request", () => {
    const token = createReplyCapabilityToken("request-123");

    expect(verifyReplyCapabilityToken("request-456", token)).toBe(false);
  });

  it("rejects tampered tokens", () => {
    const token = `${createReplyCapabilityToken("request-123")}tampered`;

    expect(verifyReplyCapabilityToken("request-123", token)).toBe(false);
  });
});
