import "server-only";

import { env } from "@/lib/env";
import {
  buildMagicLinkEmail,
  EmailDeliveryError,
  isEmailDeliveryConfigured,
  sendEmail,
} from "@/lib/server/email-delivery";

export { EmailDeliveryError };

export async function deliverMagicLink(email: string, verifyUrl: string) {
  if (env.AUTH_LINK_DELIVERY === "log") {
    console.info(`[ProofPing] Magic link for ${email}: ${verifyUrl}`);
    return;
  }

  if (shouldExposeMagicLinkInResponse()) {
    return;
  }

  if (env.AUTH_LINK_DELIVERY === "email" || isEmailDeliveryConfigured()) {
    const content = buildMagicLinkEmail(verifyUrl);

    await sendEmail({
      to: email,
      subject: "Your ProofPing sign-in link",
      text: content.text,
      html: content.html,
    });
    return;
  }

  throw new EmailDeliveryError(
    "Magic link email delivery is not configured. Set AUTH_LINK_DELIVERY=email with RESEND_API_KEY and EMAIL_FROM.",
  );
}

export function shouldExposeMagicLinkInResponse() {
  return (
    env.AUTH_LINK_DELIVERY === "response" && process.env.NODE_ENV !== "production"
  );
}
