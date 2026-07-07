export const paymentKindValues = ["DONATION", "URGENT_BOOST"] as const;

export type PaymentKindValue = (typeof paymentKindValues)[number];

export function getPaymentKindLabel(kind: string) {
  if (kind === "DONATION") {
    return "Donation";
  }

  if (kind === "URGENT_BOOST") {
    return "Urgent boost";
  }

  return kind;
}

export function isDonationCheckout(metadata: Record<string, string>) {
  return metadata.kind === "donation";
}

export function isUrgentBoostCheckout(metadata: Record<string, string>) {
  return metadata.kind === "urgent_boost";
}

export function formatPaymentAmount(amountCents: number | null, currency: string | null) {
  if (amountCents === null || !currency) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}
