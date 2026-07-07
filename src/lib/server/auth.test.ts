import { describe, expect, it } from "vitest";

import { demoAuthUser, getCurrentUser, requireCurrentUser } from "@/lib/server/auth";

describe("auth placeholder", () => {
  it("uses the local demo user while Sprint 1 auth is a placeholder", async () => {
    await expect(getCurrentUser()).resolves.toEqual(demoAuthUser);
  });

  it("allows server code to require the demo user in local development", async () => {
    await expect(requireCurrentUser()).resolves.toEqual(demoAuthUser);
  });
});
