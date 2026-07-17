import Link from "next/link";

import { ProofResultBadge } from "@/components/proof-result-badge";
import { ProofStatsRow } from "@/components/proof-stats-row";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { SiteShell } from "@/components/site-shell";
import { UrgentBadge } from "@/components/urgent-badge";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { getProofRequestCategoryLabel } from "@/lib/proof-requests/categories";
import { getProofRequestStatusLabel } from "@/lib/proof-requests/status";
import { listDiscoverableProofRequests } from "@/lib/server/proof-requests";

export const dynamic = "force-dynamic";

export default async function DiscoverRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const locationQuery = location?.trim() ?? "";
  const result = await getDiscoverableRequests(locationQuery);

  return (
    <SiteShell width="narrow">
      <section className="grid gap-3 text-center sm:text-left">
        <p className="text-sm font-semibold text-accent-strong">Trust-to-trust</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Help someone verify before they pay.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Browse requests people chose to make visible to local helpers. If you
          know the place, seller, street, or situation, one quick reply can save
          someone from a bad decision.
        </p>
      </section>

      <form className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 sm:flex-row">
        <label className="grid flex-1 gap-1">
          <span className="text-xs font-semibold text-muted">
            City or neighborhood
          </span>
          <input
            className="min-h-10 rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-accent"
            defaultValue={locationQuery}
            maxLength={160}
            name="location"
            placeholder="Oslo, Kampala, Lagos..."
          />
        </label>
        <button
          className="inline-flex min-h-10 items-center justify-center self-end rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong"
          type="submit"
        >
          Find requests
        </button>
      </form>

      {!result.ok ? (
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">Connect PostgreSQL</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              The local request feed needs the database. Check `DATABASE_URL`
              and migrations, then reload.
            </p>
          </FeedCardBody>
        </FeedCard>
      ) : result.requests.length === 0 ? (
        <FeedCard>
          <FeedCardBody>
            <h2 className="text-lg font-semibold">No local requests yet</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Try another location, or create the first nearby request people
              can help with.
            </p>
            <Link
              className="mt-3 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white"
              href="/requests/new"
            >
              Create request
            </Link>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <section className="grid gap-3" aria-label="Discoverable proof requests">
          {result.requests.map((request) => (
            <FeedCard key={request.id}>
              <FeedCardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted">
                      {getProofRequestCategoryLabel(request.category)}
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold leading-snug">
                      <Link
                        className="hover:text-accent-strong"
                        href={`/requests/${request.id}`}
                      >
                        {request.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      {request.locationHint ?? "Location shared by requester"}
                      {" · "}
                      {getProofRequestStatusLabel(request.status)}
                      {" · "}
                      <ProofTimestamp value={request.createdAt} />
                    </p>
                  </div>
                  {request.isUrgentBoosted ? <UrgentBadge /> : null}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/90">
                  {request.body}
                </p>

                <div className="mt-3 grid gap-2 border-t border-line pt-3">
                  <ProofResultBadge summary={request.replySummary} />
                  <ProofStatsRow summary={request.replySummary} />
                </div>

                <div className="mt-4">
                  <Link
                    className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white"
                    href={`/requests/${request.id}`}
                  >
                    Reply if you can help
                  </Link>
                </div>
              </FeedCardBody>
            </FeedCard>
          ))}
        </section>
      )}

      <p className="rounded-md border border-line bg-surface px-4 py-3 text-xs leading-5 text-muted">
        Safety rule: help with public, lawful checks only. Do not answer or post
        requests for stalking, private identity data, harassment, children, or
        sensitive personal tracking.
      </p>
    </SiteShell>
  );
}

async function getDiscoverableRequests(location: string) {
  try {
    const page = await listDiscoverableProofRequests({
      location: location || null,
    });

    return {
      ok: true as const,
      requests: page.items,
    };
  } catch {
    return {
      ok: false as const,
      requests: [],
    };
  }
}
