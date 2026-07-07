import "server-only";

import Stripe from "stripe";

import { PaymentsNotConfiguredError } from "@/lib/payments/errors";
import { env } from "@/lib/env";

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new PaymentsNotConfiguredError();
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}
