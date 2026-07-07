import { describe, expect, it } from "vitest";

import {
  canAcceptReplies,
  getProofRequestStatusLabel,
} from "@/lib/proof-requests/status";

describe("proof request status helpers", () => {
  it("formats status labels for display", () => {
    expect(getProofRequestStatusLabel("SOLVED")).toBe("Solved");
    expect(getProofRequestStatusLabel("OPEN")).toBe("Open");
  });

  it("allows replies on open, unresolved, and suspicious requests", () => {
    expect(canAcceptReplies("OPEN")).toBe(true);
    expect(canAcceptReplies("UNRESOLVED")).toBe(true);
    expect(canAcceptReplies("SUSPICIOUS")).toBe(true);
  });

  it("blocks replies on solved and closed requests", () => {
    expect(canAcceptReplies("SOLVED")).toBe(false);
    expect(canAcceptReplies("CLOSED")).toBe(false);
  });
});
