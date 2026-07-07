import "server-only";

import { env } from "@/lib/env";

export type IntegrationAvailability = {
  donations: boolean;
  urgentBoost: boolean;
  aiImprove: boolean;
};

export function isStripeDonationConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_DONATION);
}

export function isUrgentBoostConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_URGENT_BOOST);
}

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function isOpenAIConfigured() {
  return Boolean(env.OPENAI_API_KEY);
}

export function getIntegrationAvailability(): IntegrationAvailability {
  return {
    donations: isStripeDonationConfigured(),
    urgentBoost: isUrgentBoostConfigured(),
    aiImprove: isOpenAIConfigured(),
  };
}
