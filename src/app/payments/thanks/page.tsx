import Link from "next/link";
import { redirect } from "next/navigation";

import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/server/auth";
import { confirmCheckoutSessionForUser } from "@/lib/server/payment-records";

export const dynamic = "force-dynamic";

export default async function PaymentThanksPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    session_id?: string;
    request_id?: string;
    cancelled?: string;
  }>;
}) {
  const user = await getCurrentUser();
  const { kind, session_id: sessionId, request_id: requestId, cancelled } =
    await searchParams;

  if (cancelled === "1") {
    return (
      <SiteShell width="narrow">
        <FeedCard>
          <FeedCardBody className="grid gap-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Checkout cancelled</h1>
            <p className="text-sm leading-6 text-muted">
              No charge was made. You can support ProofPing any time.
            </p>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-strong"
              href="/"
            >
              Back home
            </Link>
          </FeedCardBody>
        </FeedCard>
      </SiteShell>
    );
  }

  if (!user) {
    redirect("/login");
  }

  let paymentRecorded = false;
  let paymentError: string | null = null;

  if (sessionId) {
    try {
      const result = await confirmCheckoutSessionForUser({
        sessionId,
        user,
      });

      paymentRecorded = Boolean(result?.recorded);

      if (!paymentRecorded) {
        paymentError = "Payment not confirmed yet. Reload in a moment.";
      }
    } catch {
      paymentError = "Could not save this payment. Try again or contact support.";
    }
  }

  const isDonation = kind === "donation";
  const isBoost = kind === "urgent_boost";

  return (
    <SiteShell width="narrow">
      <FeedCard>
        <FeedCardBody className="grid gap-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {paymentRecorded
              ? isBoost
                ? "Urgent boost is active"
                : "Thank you for supporting ProofPing"
              : "Thanks for checking out"}
          </h1>
          <p className="text-sm leading-6 text-muted">
            {paymentRecorded
              ? isBoost
                ? "Your request is marked urgent. Share it with someone there."
                : "Your donation helps keep real human proof free for everyone."
              : paymentError ?? "If you completed payment, it may take a moment to appear."}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isBoost && requestId ? (
              <Link
                className="inline-flex h-11 min-w-40 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-strong"
                href={`/requests/${requestId}`}
              >
                View request
              </Link>
            ) : null}
            {isDonation ? (
              <Link
                className="inline-flex h-11 min-w-40 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-strong"
                href="/requests/new"
              >
                Ask for proof
              </Link>
            ) : null}
            <Link
              className="inline-flex h-11 min-w-40 items-center justify-center rounded-md px-6 text-sm font-semibold text-muted hover:bg-foreground/5 hover:text-foreground"
              href="/dashboard"
            >
              My requests
            </Link>
          </div>
        </FeedCardBody>
      </FeedCard>
    </SiteShell>
  );
}
