import { afterEach, describe, expect, it, vi } from "vitest";

describe("email delivery", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("reports when email delivery is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");

    const { isEmailDeliveryConfigured } = await import("@/lib/server/email-delivery");

    expect(isEmailDeliveryConfigured()).toBe(false);
  });

  it("builds a magic link email with text and html", async () => {
    const { buildMagicLinkEmail } = await import("@/lib/server/email-delivery");
    const email = buildMagicLinkEmail("http://localhost:3000/auth/verify?token=abc");

    expect(email.text).toContain("http://localhost:3000/auth/verify?token=abc");
    expect(email.html).toContain("Sign in to ProofPing");
    expect(email.html).toContain("http://localhost:3000/auth/verify?token=abc");
  });

  it("sends email through Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "ProofPing <onboarding@resend.dev>");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { sendEmail } = await import("@/lib/server/email-delivery");

    await sendEmail({
      to: "you@example.com",
      subject: "Sign in",
      text: "text",
      html: "<p>html</p>",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test_key",
        }),
      }),
    );
  });

  it("throws when Resend rejects the request", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "ProofPing <onboarding@resend.dev>");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Invalid API key" }), {
          status: 401,
        }),
      ),
    );

    const { EmailDeliveryError, sendEmail } = await import("@/lib/server/email-delivery");

    await expect(
      sendEmail({
        to: "you@example.com",
        subject: "Sign in",
        text: "text",
        html: "<p>html</p>",
      }),
    ).rejects.toThrow(EmailDeliveryError);
  });
});
