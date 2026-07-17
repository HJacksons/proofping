import { describe, expect, it } from "vitest";

import {
  adminVisitsQuerySchema,
  recordSiteVisitSchema,
} from "@/lib/analytics/validation";
import {
  extractReferrerHost,
  isBotUserAgent,
} from "@/lib/server/site-visits";

describe("recordSiteVisitSchema", () => {
  it("accepts a normal page path", () => {
    expect(recordSiteVisitSchema.parse({ path: "/login" })).toEqual({
      path: "/login",
      referrer: undefined,
    });
  });

  it("rejects api and next internals", () => {
    expect(() =>
      recordSiteVisitSchema.parse({ path: "/api/analytics/visit" }),
    ).toThrow();
    expect(() =>
      recordSiteVisitSchema.parse({ path: "/_next/static/chunk.js" }),
    ).toThrow();
  });
});

describe("adminVisitsQuerySchema", () => {
  it("defaults days to 14", () => {
    expect(adminVisitsQuerySchema.parse({})).toEqual({ days: 14 });
  });

  it("clamps invalid days", () => {
    expect(() => adminVisitsQuerySchema.parse({ days: 0 })).toThrow();
    expect(() => adminVisitsQuerySchema.parse({ days: 100 })).toThrow();
  });
});

describe("site visit helpers", () => {
  it("extracts referrer host only", () => {
    expect(
      extractReferrerHost("https://news.ycombinator.com/item?id=1"),
    ).toBe("news.ycombinator.com");
    expect(extractReferrerHost("not-a-url")).toBeNull();
  });

  it("detects common bots", () => {
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(
      true,
    );
    expect(
      isBotUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe(false);
  });
});
