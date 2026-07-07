import { PaymentsNotConfiguredError } from "@/lib/payments/errors";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import { createDonationCheckoutSession } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { requireCurrentUser } = await import("@/lib/server/auth");
    const authUser = await requireCurrentUser();
    const checkout = await createDonationCheckoutSession(authUser.id);

    return Response.json(checkout);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdultVerificationRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof PaymentsNotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json({ error: "Unable to start donation checkout." }, { status: 500 });
  }
}
