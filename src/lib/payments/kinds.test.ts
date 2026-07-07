import { describe, expect, it } from "vitest";

import {
  formatPaymentAmount,
  getPaymentKindLabel,
  isDonationCheckout,
} from "@/lib/payments/kinds";

describe("payment kinds", () => {
  it("labels payment kinds", () => {
    expect(getPaymentKindLabel("DONATION")).toBe("Donation");
    expect(getPaymentKindLabel("URGENT_BOOST")).toBe("Urgent boost");
  });

  it("detects donation checkout metadata", () => {
    expect(isDonationCheckout({ kind: "donation" })).toBe(true);
  });

  it("formats payment amounts", () => {
    expect(formatPaymentAmount(500, "usd")).toBe("$5.00");
  });
});
