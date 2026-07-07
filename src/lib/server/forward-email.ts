import "server-only";

import { env } from "@/lib/env";

type ForwardNotificationInput = {
  recipientEmail: string;
  helperLinkUrl: string;
  requestTitle: string;
  note: string | null;
};

export async function deliverForwardNotification(input: ForwardNotificationInput) {
  const message = [
    `ProofPing forward for: ${input.requestTitle}`,
    input.note ? `Note: ${input.note}` : null,
    `Helper link: ${input.helperLinkUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (env.AUTH_LINK_DELIVERY === "log") {
    console.info(
      `[ProofPing] Forward notification for ${input.recipientEmail}:\n${message}`,
    );
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  throw new Error(
    "Forward notification delivery is not configured for production yet.",
  );
}

export function shouldExposeForwardLinkInResponse() {
  return (
    env.AUTH_LINK_DELIVERY === "response" && process.env.NODE_ENV !== "production"
  );
}
