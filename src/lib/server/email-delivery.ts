import "server-only";

import { env } from "@/lib/env";

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export function isEmailDeliveryConfigured() {
  return Boolean(env.RESEND_API_KEY?.trim() && env.EMAIL_FROM?.trim());
}

export async function sendEmail(input: SendEmailInput) {
  if (!isEmailDeliveryConfigured()) {
    throw new EmailDeliveryError(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    let detail = "Unable to send email.";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        detail = payload.message;
      }
    } catch {
      // Keep generic detail when Resend does not return JSON.
    }

    throw new EmailDeliveryError(detail);
  }
}

export function buildMagicLinkEmail(verifyUrl: string) {
  const text = [
    "Sign in to ProofPing",
    "",
    "Use this one-time link to manage your proof requests:",
    verifyUrl,
    "",
    "This link expires in 15 minutes. If you did not request it, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #050505;">
      <p style="margin: 0 0 16px;">Sign in to <strong>ProofPing</strong></p>
      <p style="margin: 0 0 20px;">Use this one-time link to manage your proof requests:</p>
      <p style="margin: 0 0 24px;">
        <a href="${verifyUrl}" style="display: inline-block; background: #0f6b57; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 18px; border-radius: 8px;">
          Sign in to ProofPing
        </a>
      </p>
      <p style="margin: 0 0 12px; color: #65676b; font-size: 14px;">
        Or copy this link:<br />
        <a href="${verifyUrl}" style="color: #0a493d; word-break: break-all;">${verifyUrl}</a>
      </p>
      <p style="margin: 0; color: #65676b; font-size: 14px;">
        This link expires in 15 minutes. If you did not request it, you can ignore this email.
      </p>
    </div>
  `.trim();

  return { text, html };
}
