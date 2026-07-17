import Link from "next/link";
import { redirect } from "next/navigation";

import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { requireAdminUser } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  return (
    <SiteShell width="narrow">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin</h1>
        <p className="text-sm leading-6 text-muted">Internal tools for ProofPing.</p>
      </div>

      <div className="grid gap-3">
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">Site visits</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Anonymous page views and top paths. No IPs or emails stored.
            </p>
            <Link
              className="mt-3 inline-flex text-sm font-semibold text-accent-strong hover:underline"
              href="/admin/visits"
            >
              View visits
            </Link>
          </FeedCardBody>
        </FeedCard>

        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">Payments</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Donations and urgent boosts recorded from Stripe checkout.
            </p>
            <Link
              className="mt-3 inline-flex text-sm font-semibold text-accent-strong hover:underline"
              href="/admin/payments"
            >
              View payments
            </Link>
          </FeedCardBody>
        </FeedCard>
      </div>
    </SiteShell>
  );
}
