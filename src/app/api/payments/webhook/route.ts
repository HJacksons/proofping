import { PaymentsNotConfiguredError } from "@/lib/payments/errors";
import { handleStripeWebhookPayload } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await handleStripeWebhookPayload(payload, signature);

    return Response.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof PaymentsNotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json({ error: "Webhook handling failed." }, { status: 400 });
  }
}
