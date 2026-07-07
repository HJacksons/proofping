import { describe, expect, it } from "vitest";

import { formatProofTimestamp } from "@/lib/datetime/format";

describe("formatProofTimestamp", () => {
  const now = new Date("2026-07-07T14:00:00.000Z");

  it("shows just now for very recent replies", () => {
    expect(
      formatProofTimestamp("2026-07-07T13:59:30.000Z", now),
    ).toBe("Just now");
  });

  it("shows minutes ago for recent replies", () => {
    expect(
      formatProofTimestamp("2026-07-07T13:45:00.000Z", now),
    ).toBe("15 min ago");
  });

  it("shows hours ago for same-day replies", () => {
    expect(
      formatProofTimestamp("2026-07-07T10:00:00.000Z", now),
    ).toBe("4 hr ago");
  });

  it("shows a full timestamp for older replies", () => {
    expect(
      formatProofTimestamp("2026-06-20T10:15:00.000Z", now),
    ).toContain("Jun");
  });
});
