import { describe, expect, it } from "vitest";

import { env, resolveStripeEnv } from "@/lib/env";

describe("env", () => {
  it("loads the app URL and database URL", () => {
    expect(env.APP_URL).toMatch(/^https?:\/\//);
    expect(env.DATABASE_URL).toContain("postgresql://");
  });

  it("prefers LIVE_STRIPE_* values over STRIPE_*", () => {
    expect(resolveStripeEnv("sk_live_abc", "sk_test_xyz")).toBe("sk_live_abc");
    expect(resolveStripeEnv("", "sk_test_xyz")).toBe("sk_test_xyz");
    expect(resolveStripeEnv(undefined, undefined)).toBeUndefined();
  });
});
