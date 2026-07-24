import { describe, expect, it } from "vitest";

import { getAskIntent } from "@/lib/proof-requests/ask-intent";

describe("getAskIntent", () => {
  it("treats listings and shops as deal asks", () => {
    expect(getAskIntent("APARTMENT_LISTING")).toBe("deal");
    expect(getAskIntent("SELLER_OR_SHOP")).toBe("deal");
  });

  it("treats queues and local situations as right-now asks", () => {
    expect(getAskIntent("FACILITY_OR_QUEUE")).toBe("right_now");
    expect(getAskIntent("LOCAL_SITUATION")).toBe("right_now");
  });

  it("defaults to general", () => {
    expect(getAskIntent("OTHER")).toBe("general");
    expect(getAskIntent(null)).toBe("general");
  });
});
