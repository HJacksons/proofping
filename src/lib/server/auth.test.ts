import { afterEach, describe, expect, it, vi } from "vitest";

describe("auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses an explicitly configured demo user when demo auth is enabled", async () => {
    vi.stubEnv("ENABLE_DEMO_AUTH", "true");
    vi.stubEnv("DEMO_AUTH_EMAIL", "owner@example.test");

    const { getCurrentUser, requireCurrentUser } = await import("@/lib/server/auth");
    const expectedUser = {
      id: "demo:owner@example.test",
      email: "owner@example.test",
      isAdultVerified: true,
    };

    await expect(getCurrentUser()).resolves.toEqual(expectedUser);
    await expect(requireCurrentUser()).resolves.toEqual(expectedUser);
  });

  it("does not activate demo auth without a configured demo email", async () => {
    vi.stubEnv("ENABLE_DEMO_AUTH", "true");
    vi.stubEnv("DEMO_AUTH_EMAIL", "");

    const { isDemoAuthActive } = await import("@/lib/server/auth");

    expect(isDemoAuthActive()).toBe(false);
  });
});
