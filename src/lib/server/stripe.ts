import "server-only";

import { isUrgentBoostCheckout } from "@/lib/payments/kinds";
import { PaymentsNotConfiguredError } from "@/lib/payments/errors";
import { env } from "@/lib/env";
import {
  isStripeDonationConfigured,
  isUrgentBoostConfigured,
} from "@/lib/server/integrations";
import { completePaidCheckoutSession } from "@/lib/server/payment-records";
import { getStripeClient } from "@/lib/server/stripe-client";

export async function createDonationCheckoutSession(userId: string) {
  if (!isStripeDonationConfigured()) {
    throw new PaymentsNotConfiguredError();
  }

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: env.STRIPE_PRICE_DONATION!,
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/payments/thanks?kind=donation&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_URL}/payments/thanks?cancelled=1`,
    metadata: {
      kind: "donation",
      userId,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return {
    url: session.url,
  };
}

export async function createUrgentBoostCheckoutSession(input: {
  userId: string;
  requestId: string;
  requestTitle: string;
}) {
  if (!isUrgentBoostConfigured()) {
    throw new PaymentsNotConfiguredError();
  }

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: env.STRIPE_PRICE_URGENT_BOOST!,
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/payments/thanks?kind=urgent_boost&session_id={CHECKOUT_SESSION_ID}&request_id=${input.requestId}`,
    cancel_url: `${env.APP_URL}/requests/${input.requestId}?boosted=0`,
    metadata: {
      kind: "urgent_boost",
      userId: input.userId,
      requestId: input.requestId,
      requestTitle: input.requestTitle.slice(0, 120),
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return {
    url: session.url,
  };
}

export async function handleStripeWebhookPayload(
  payload: string,
  signature: string | null,
) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new PaymentsNotConfiguredError();
  }

  if (!signature) {
    throw new Error("Missing Stripe signature.");
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type !== "checkout.session.completed") {
    return { handled: false as const };
  }

  const session = event.data.object;

  if (session.payment_status !== "paid" || !session.metadata) {
    return { handled: false as const };
  }

  const result = await completePaidCheckoutSession(session);

  return {
    handled: result.recorded,
    kind: result.kind,
    requestId: result.requestId ?? null,
  };
}

export async function confirmUrgentBoostFromCheckoutSession(input: {
  sessionId: string;
  userId: string;
  requestId: string;
}) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId);

  if (
    session.payment_status !== "paid" ||
    !session.metadata ||
    !isUrgentBoostCheckout(session.metadata)
  ) {
    return { applied: false as const };
  }

  if (
    session.metadata.userId !== input.userId ||
    session.metadata.requestId !== input.requestId
  ) {
    const { ProofRequestForbiddenError } = await import("@/lib/proof-requests/errors");
    throw new ProofRequestForbiddenError();
  }

  await completePaidCheckoutSession(session);

  return { applied: true as const };
}
