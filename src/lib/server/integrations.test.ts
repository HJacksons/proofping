import { describe, expect, it } from "vitest";

import {
  getIntegrationAvailability,
  isOpenAIConfigured,
  isStripeDonationConfigured,
  isUrgentBoostConfigured,
} from "@/lib/server/integrations";

describe("integrations", () => {
  it("reports integration availability from env", () => {
    const availability = getIntegrationAvailability();

    expect(availability).toEqual({
      donations: isStripeDonationConfigured(),
      urgentBoost: isUrgentBoostConfigured(),
      aiImprove: isOpenAIConfigured(),
    });
  });
});
