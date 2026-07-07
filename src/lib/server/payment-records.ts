import "server-only";

import type Stripe from "stripe";

import {
  isDonationCheckout,
  isUrgentBoostCheckout,
} from "@/lib/payments/kinds";
import { fulfillUrgentBoostPayment } from "@/lib/server/proof-request-boosts";
import { prisma } from "@/lib/server/db";
import type { AuthUser } from "@/lib/server/auth";
import { ensureUserForAuth } from "@/lib/server/users";

export type PaymentRecordDTO = {
  id: string;
  kind: string;
  status: string;
  amountCents: number | null;
  currency: string | null;
  paidAt: string | null;
  createdAt: string;
  userEmail: string;
  requestId: string | null;
  requestTitle: string | null;
};

function paymentKindFromMetadata(metadata: Record<string, string>) {
  if (isDonationCheckout(metadata)) {
    return "DONATION" as const;
  }

  if (isUrgentBoostCheckout(metadata)) {
    return "URGENT_BOOST" as const;
  }

  return null;
}

function getSessionAmount(session: Stripe.Checkout.Session) {
  return {
    amountCents: session.amount_total,
    currency: session.currency,
  };
}

export async function completePaidCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" || !session.metadata) {
    return { recorded: false as const, kind: null };
  }

  const kind = paymentKindFromMetadata(session.metadata);
  const userId = session.metadata.userId;

  if (!kind || !userId || !session.id) {
    throw new Error("Checkout session metadata is incomplete.");
  }

  const { amountCents, currency } = getSessionAmount(session);
  const requestId = session.metadata.requestId ?? null;

  const payment = await prisma.payment.upsert({
    where: {
      stripeSessionId: session.id,
    },
    create: {
      userId,
      requestId,
      kind,
      status: "PAID",
      stripeSessionId: session.id,
      amountCents,
      currency,
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      amountCents,
      currency,
      paidAt: new Date(),
    },
  });

  if (kind === "URGENT_BOOST" && requestId) {
    await fulfillUrgentBoostPayment(requestId, userId);
  }

  return {
    recorded: true as const,
    kind,
    paymentId: payment.id,
    requestId,
  };
}

export async function confirmCheckoutSessionForUser(input: {
  sessionId: string;
  user: AuthUser;
}) {
  const { getStripeClient } = await import("@/lib/server/stripe-client");
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId);

  if (!session.metadata || session.metadata.userId !== input.user.id) {
    const { ProofRequestForbiddenError } = await import("@/lib/proof-requests/errors");
    throw new ProofRequestForbiddenError();
  }

  await ensureUserForAuth(input.user);

  return completePaidCheckoutSession(session);
}

export async function listPaymentRecords(limit = 50): Promise<PaymentRecordDTO[]> {
  const payments = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          email: true,
        },
      },
      request: {
        select: {
          title: true,
        },
      },
    },
  });

  return payments.map((payment) => ({
    id: payment.id,
    kind: payment.kind,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    userEmail: payment.user.email,
    requestId: payment.requestId,
    requestTitle: payment.request?.title ?? null,
  }));
}
