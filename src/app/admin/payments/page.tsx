import Link from "next/link";
import { redirect } from "next/navigation";

import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import {
  formatPaymentAmount,
  getPaymentKindLabel,
} from "@/lib/payments/kinds";
import { requireAdminUser } from "@/lib/server/admin";
import { listPaymentRecords } from "@/lib/server/payment-records";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const payments = await listPaymentRecords().catch(() => []);

  return (
    <SiteShell>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted">
          <Link className="hover:text-foreground" href="/admin">
            Admin
          </Link>
          {" / Payments"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
        <p className="text-sm leading-6 text-muted">
          Recent donations and urgent boosts.
        </p>
      </div>

      {payments.length === 0 ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">No payments recorded yet.</p>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <div className="grid gap-2">
          {payments.map((payment) => (
            <FeedCard key={payment.id}>
              <FeedCardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{getPaymentKindLabel(payment.kind)}</p>
                    <p className="mt-1 text-sm text-muted">{payment.userEmail}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPaymentAmount(payment.amountCents, payment.currency)}
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {payment.status} · <ProofTimestamp value={payment.paidAt ?? payment.createdAt} />
                </p>
                {payment.requestId ? (
                  <p className="mt-2 text-sm">
                    <Link
                      className="font-semibold text-accent-strong hover:underline"
                      href={`/requests/${payment.requestId}`}
                    >
                      {payment.requestTitle ?? "View request"}
                    </Link>
                  </p>
                ) : null}
              </FeedCardBody>
            </FeedCard>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
