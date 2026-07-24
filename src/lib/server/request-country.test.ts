import { afterEach, describe, expect, it, vi } from "vitest";

import {
  countryCodeFromHeaders,
  countryDisplayName,
  extractClientIp,
  isPublicIp,
  normalizeCountryCode,
} from "@/lib/server/request-country";

describe("request-country", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("normalizes ISO country codes and drops CDN unknowns", () => {
    expect(normalizeCountryCode(" ng ")).toBe("NG");
    expect(normalizeCountryCode("XX")).toBeNull();
    expect(normalizeCountryCode("USA")).toBeNull();
  });

  it("prefers Vercel / Cloudflare country headers", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "us",
      "x-forwarded-for": "8.8.8.8",
    });
    expect(countryCodeFromHeaders(headers)).toBe("US");
  });

  it("extracts the first public forwarded IP only", () => {
    expect(
      extractClientIp(
        new Headers({ "x-forwarded-for": "10.0.0.1, 8.8.8.8" }),
      ),
    ).toBe("8.8.8.8");
    expect(
      extractClientIp(new Headers({ "x-forwarded-for": "8.8.8.8, 1.1.1.1" })),
    ).toBe("8.8.8.8");
    expect(isPublicIp("192.168.1.1")).toBe(false);
  });

  it("formats country display names", () => {
    expect(countryDisplayName("NG")).toMatch(/Nigeria/i);
  });

  it("uses local egress lookup when there is no public client IP", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, country_code: "NO" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { resolveRequestCountryCode } = await import(
      "@/lib/server/request-country"
    );
    await expect(resolveRequestCountryCode(new Headers())).resolves.toBe("NO");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://ipwho.is/?fields=success,country_code",
      expect.any(Object),
    );
  });

  it("does not use egress lookup in production without a client IP", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { resolveRequestCountryCode } = await import(
      "@/lib/server/request-country"
    );
    await expect(resolveRequestCountryCode(new Headers())).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
