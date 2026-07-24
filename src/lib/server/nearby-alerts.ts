import "server-only";

import { env } from "@/lib/env";
import {
  isEmailDeliveryConfigured,
  sendEmail,
} from "@/lib/server/email-delivery";

export function buildProofReplyAlertEmail(input: {
  requestTitle: string;
  requestUrl: string;
}) {
  const subject = `New proof card: ${input.requestTitle}`;
  const text = [
    "Someone sent a proof card on your ProofPing ask.",
    "",
    input.requestTitle,
    "",
    `Open it: ${input.requestUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #050505;">
      <p style="margin: 0 0 12px;">Someone sent a <strong>proof card</strong> on your ask.</p>
      <p style="margin: 0 0 8px; font-size: 18px; font-weight: 700;">${escapeHtml(input.requestTitle)}</p>
      <p style="margin: 0 0 24px;">
        <a href="${input.requestUrl}" style="display: inline-block; background: #0f6b57; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 18px; border-radius: 8px;">
          View proof cards
        </a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function notifyRequesterOfProofReply(input: {
  requesterEmail: string;
  requestId: string;
  requestTitle: string;
}) {
  const requestUrl = new URL(
    `/requests/${input.requestId}`,
    env.APP_URL,
  ).toString();
  const email = buildProofReplyAlertEmail({
    requestTitle: input.requestTitle,
    requestUrl,
  });

  try {
    if (env.AUTH_LINK_DELIVERY === "log" || !isEmailDeliveryConfigured()) {
      console.info(
        `[ProofPing] Proof reply alert for ${input.requesterEmail}: ${requestUrl}`,
      );
      return { notified: true };
    }

    await sendEmail({
      to: input.requesterEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return { notified: true };
  } catch (error) {
    console.error("[ProofPing] Proof reply alert failed", error);
    return { notified: false };
  }
}
