import { describe, expect, it } from "vitest";

import {
  buildProofRequestReplyShareUrl,
  buildProofRequestShareUrl,
} from "@/lib/proof-requests/share";

describe("buildProofRequestShareUrl", () => {
  it("builds a view URL for a proof request", () => {
    expect(
      buildProofRequestShareUrl("http://localhost:3000", "request-123"),
    ).toBe("http://localhost:3000/requests/request-123");
  });

  it("builds a helper reply URL with a signed token", () => {
    const url = buildProofRequestReplyShareUrl(
      "http://localhost:3000",
      "request-123",
    );

    expect(url).toContain("http://localhost:3000/requests/request-123?reply=");
  });
});
