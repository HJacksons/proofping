import { afterEach, describe, expect, it, vi } from "vitest";

describe("auth email delivery", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("logs magic links when delivery mode is log", async () => {
    vi.stubEnv("AUTH_LINK_DELIVERY", "log");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const { deliverMagicLink } = await import("@/lib/server/auth-email");

    await deliverMagicLink("you@example.com", "http://localhost:3000/auth/verify?token=abc");

    expect(infoSpy).toHaveBeenCalledWith(
      "[ProofPing] Magic link for you@example.com: http://localhost:3000/auth/verify?token=abc",
    );
  });

  it("sends email when delivery mode is email and Resend is configured", async () => {
    vi.stubEnv("AUTH_LINK_DELIVERY", "email");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "ProofPing <onboarding@resend.dev>");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { deliverMagicLink } = await import("@/lib/server/auth-email");

    await deliverMagicLink("you@example.com", "http://localhost:3000/auth/verify?token=abc");

    expect(fetchMock).toHaveBeenCalled();
  });

  it("exposes the verify URL in response mode during development", async () => {
    vi.stubEnv("AUTH_LINK_DELIVERY", "response");
    vi.stubEnv("NODE_ENV", "development");

    const { shouldExposeMagicLinkInResponse } = await import("@/lib/server/auth-email");

    expect(shouldExposeMagicLinkInResponse()).toBe(true);
  });

  it("does not expose the verify URL when email mode is active", async () => {
    vi.stubEnv("AUTH_LINK_DELIVERY", "email");
    vi.stubEnv("NODE_ENV", "development");

    const { shouldExposeMagicLinkInResponse } = await import("@/lib/server/auth-email");

    expect(shouldExposeMagicLinkInResponse()).toBe(false);
  });
});
