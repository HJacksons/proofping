import { describe, expect, it } from "vitest";

import { env } from "@/lib/env";

describe("env", () => {
  it("loads the app URL and database URL", () => {
    expect(env.APP_URL).toMatch(/^https?:\/\//);
    expect(env.DATABASE_URL).toContain("postgresql://");
  });
});
