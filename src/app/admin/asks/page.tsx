import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminCloseAskButton } from "@/components/admin-close-ask-button";
import { ExpandableList } from "@/components/expandable-list";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { requireAdminUser } from "@/lib/server/admin";
import { listAdminOpenAsks } from "@/lib/server/admin-asks";
import { getProofRequestVisibilityLabel } from "@/lib/proof-requests/visibility";

export const dynamic = "force-dynamic";

export default async function AdminAsksPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  const overview = await listAdminOpenAsks().catch(() => null);

  return (
    <SiteShell>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted">
          <Link className="hover:text-foreground" href="/admin">
            Admin
          </Link>
          {" / Open asks"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Open asks
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          Close test junk or stale asks so Help nearby stays useful. Closing
          removes them from the nearby list.
        </p>
      </div>

      {!overview ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">Unable to load open asks.</p>
          </FeedCardBody>
        </FeedCard>
      ) : overview.asks.length === 0 ? (
        <FeedCard>
          <FeedCardBody>
            <p className="text-sm text-muted">No open asks right now.</p>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <FeedCard>
          <FeedCardBody>
            {overview.truncated ? (
              <p className="mb-3 text-xs text-muted">
                Showing the newest {overview.asks.length} open asks.
              </p>
            ) : null}
            <ExpandableList initialCount={20}>
              {overview.asks.map((ask) => (
                <li
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-3 last:border-0"
                  key={ask.id}
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      className="font-semibold hover:text-accent-strong"
                      href={`/requests/${ask.id}`}
                    >
                      {ask.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {ask.locationHint ?? "No place"}
                      {" · "}
                      {getProofRequestVisibilityLabel(ask.visibility)}
                      {" · "}
                      <ProofTimestamp value={ask.createdAt} />
                      {" · "}
                      {ask.creatorEmail}
                    </p>
                  </div>
                  <AdminCloseAskButton requestId={ask.id} />
                </li>
              ))}
            </ExpandableList>
          </FeedCardBody>
        </FeedCard>
      )}
    </SiteShell>
  );
}
