import { ProofRequestForbiddenError } from "@/lib/proof-requests/errors";
import { UrgentBoostNotAllowedError, PaymentsNotConfiguredError } from "@/lib/payments/errors";
import {
  AdultVerificationRequiredError,
  AuthRequiredError,
} from "@/lib/server/auth";
import { startUrgentBoostCheckoutForRequest } from "@/lib/server/proof-request-boosts";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { requireCurrentUser } = await import("@/lib/server/auth");
    const authUser = await requireCurrentUser();
    const checkout = await startUrgentBoostCheckoutForRequest(id, authUser.id);

    if (!checkout) {
      return Response.json({ error: "Proof request not found." }, { status: 404 });
    }

    return Response.json(checkout);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AdultVerificationRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof ProofRequestForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof UrgentBoostNotAllowedError) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof PaymentsNotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json({ error: "Unable to start urgent boost checkout." }, { status: 500 });
  }
}
