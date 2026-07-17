import { describe, expect, it, vi, afterEach } from "vitest";

describe("parseAdminEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reads ADMIN_EMAIL when ADMIN_EMAILS is not set", async () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.test");
    vi.stubEnv("ENABLE_DEMO_AUTH", "false");
    delete process.env.ADMIN_EMAILS;

    const { isAdminUser } = await import("@/lib/server/admin");

    await expect(
      isAdminUser({
        id: "user-1",
        email: "admin@example.test",
        isAdultVerified: true,
      }),
    ).resolves.toBe(true);
  });

  it("does not grant admin access from demo auth fallback data", async () => {
    vi.stubEnv("ENABLE_DEMO_AUTH", "true");
    vi.stubEnv("ADMIN_EMAIL", "");
    delete process.env.ADMIN_EMAILS;

    const { isAdminUser } = await import("@/lib/server/admin");

    await expect(
      isAdminUser({
        id: "user-1",
        email: "demo@example.test",
        isAdultVerified: true,
      }),
    ).resolves.toBe(false);
  });
});
