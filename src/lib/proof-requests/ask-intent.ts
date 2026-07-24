/**
 * What kind of decision this ask is usually about — drives UI copy.
 * Not payment-only: campus/right-now asks are about going or waiting.
 */
export type AskIntent = "deal" | "right_now" | "general";

export function getAskIntent(category?: string | null): AskIntent {
  switch (category) {
    case "APARTMENT_LISTING":
    case "SELLER_OR_SHOP":
      return "deal";
    case "FACILITY_OR_QUEUE":
    case "LOCAL_SITUATION":
      return "right_now";
    default:
      return "general";
  }
}
