import { describe, expect, it, vi, afterEach } from "vitest";

describe("parseAdminEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads ADMIN_EMAIL when ADMIN_EMAILS is not set", async () => {
    vi.stubEnv("ADMIN_EMAIL", "jacksonherberts@gmail.com");
    vi.stubEnv("ENABLE_DEMO_AUTH", "false");
    delete process.env.ADMIN_EMAILS;

    const { isAdminUser } = await import("@/lib/server/admin");

    await expect(
      isAdminUser({
        id: "user-1",
        email: "jacksonherberts@gmail.com",
        isAdultVerified: true,
      }),
    ).resolves.toBe(true);
  });
});
