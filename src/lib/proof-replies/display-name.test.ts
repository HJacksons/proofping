import { describe, expect, it } from "vitest";

import {
  generateReplyDisplayName,
  generatePosterDisplayName,
  getReplyDisplayName,
} from "@/lib/proof-replies/display-name";

describe("reply display names", () => {
  it("generates a stable nickname from a reply id", () => {
    const replyId = "clx123replyid";

    expect(generateReplyDisplayName(replyId)).toBe(
      generateReplyDisplayName(replyId),
    );
    expect(generateReplyDisplayName(replyId)).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
  });

  it("generates different nicknames for different reply ids", () => {
    expect(generateReplyDisplayName("reply-a")).not.toBe(
      generateReplyDisplayName("reply-b"),
    );
  });

  it("prefers a stored helper name when present", () => {
    expect(getReplyDisplayName("reply-a", "  A neighbor nearby  ")).toBe(
      "A neighbor nearby",
    );
  });

  it("falls back to a generated nickname when helper name is empty", () => {
    expect(getReplyDisplayName("reply-a", "")).toBe(generateReplyDisplayName("reply-a"));
    expect(getReplyDisplayName("reply-a", null)).toBe(generateReplyDisplayName("reply-a"));
  });

  it("generates a stable poster nickname from a request id", () => {
    const requestId = "clx123requestid";

    expect(generatePosterDisplayName(requestId)).toBe(
      generatePosterDisplayName(requestId),
    );
    expect(generatePosterDisplayName(requestId)).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
    expect(generatePosterDisplayName(requestId)).not.toBe(
      generateReplyDisplayName(requestId),
    );
  });
});
