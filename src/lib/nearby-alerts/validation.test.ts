import { describe, expect, it } from "vitest";

import { nearbyAlertsPrefsSchema } from "@/lib/nearby-alerts/validation";
import { buildProofReplyAlertEmail } from "@/lib/server/nearby-alerts";

describe("nearbyAlertsPrefsSchema", () => {
  it("requires a location when alerts are enabled", () => {
    expect(
      nearbyAlertsPrefsSchema.safeParse({ enabled: true, location: "" }).success,
    ).toBe(false);
  });

  it("accepts enabled alerts with a place", () => {
    expect(
      nearbyAlertsPrefsSchema.parse({
        enabled: true,
        location: "  Campus library  ",
      }),
    ).toEqual({
      enabled: true,
      location: "Campus library",
    });
  });
});

describe("proof reply alert email", () => {
  it("builds a proof reply alert for the requester", () => {
    const email = buildProofReplyAlertEmail({
      requestTitle: "Is the printer working?",
      requestUrl: "https://getproofping.com/requests/abc",
    });

    expect(email.subject).toContain("New proof card");
    expect(email.html).toContain("View proof cards");
  });
});
