import { describe, expect, it } from "vitest";

import {
  canPurchaseUrgentBoost,
} from "@/lib/payments/boost";
import {
  isDonationCheckout,
  isUrgentBoostCheckout,
} from "@/lib/payments/kinds";

describe("canPurchaseUrgentBoost", () => {
  const request = {
    creatorId: "user-1",
    status: "OPEN",
    urgentBoostPaidAt: null,
  };

  it("allows the owner to boost an open request", () => {
    expect(canPurchaseUrgentBoost(request, "user-1")).toEqual({ ok: true });
  });

  it("blocks non-owners", () => {
    expect(canPurchaseUrgentBoost(request, "user-2")).toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("blocks already boosted requests", () => {
    expect(
      canPurchaseUrgentBoost(
        { ...request, urgentBoostPaidAt: new Date("2026-01-01") },
        "user-1",
      ),
    ).toEqual({
      ok: false,
      reason: "already-boosted",
    });
  });

  it("blocks closed requests", () => {
    expect(
      canPurchaseUrgentBoost({ ...request, status: "CLOSED" }, "user-1"),
    ).toEqual({
      ok: false,
      reason: "not-open",
    });
  });
});

describe("checkout metadata", () => {
  it("detects urgent boost checkout metadata", () => {
    expect(isUrgentBoostCheckout({ kind: "urgent_boost" })).toBe(true);
    expect(isDonationCheckout({ kind: "donation" })).toBe(true);
    expect(isUrgentBoostCheckout({ kind: "donation" })).toBe(false);
  });
});
