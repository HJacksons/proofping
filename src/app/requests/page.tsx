import Link from "next/link";

import { DiscoverRequestList } from "@/components/discover-request-list";
import { LiveNearbyRefresh } from "@/components/live-nearby-refresh";
import { NearbyActivityPulse } from "@/components/nearby-activity-pulse";
import { NearbyLocationSearch } from "@/components/nearby-location-search";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { SiteShell } from "@/components/site-shell";
import { getNearbyActivityPulse } from "@/lib/server/nearby-activity";
import { listDiscoverableProofRequests } from "@/lib/server/proof-requests";

export const dynamic = "force-dynamic";

export default async function DiscoverRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const locationQuery = location?.trim() ?? "";
  const [result, pulse] = await Promise.all([
    getDiscoverableRequests(locationQuery),
    getNearbyActivityPulse(locationQuery || null).catch(() => null),
  ]);
  const latestCreatedAt = result.ok
    ? (result.requests[0]?.createdAt ?? null)
    : null;

  return (
    <SiteShell width="narrow">
      <LiveNearbyRefresh
        latestCreatedAt={latestCreatedAt}
        location={locationQuery}
      />

      <section className="grid gap-3 text-center sm:text-left">
        <p className="text-sm font-semibold text-accent-strong">Help nearby</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Someone’s ask might save you too.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Peek at what’s open near you — help with a quick proof card, or just
          learn what’s true right now before you walk, wait, or pay. Schools,
          markets, offices, beaches, events, concerts. This list refreshes live.
        </p>
      </section>

      {pulse ? <NearbyActivityPulse {...pulse} /> : null}

      <NearbyLocationSearch initialLocation={locationQuery} />

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
            <h2 className="text-lg font-semibold">No open asks here yet</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Be the first to ask what’s true nearby — your question might save
              the next person (and you next time). Or try another place.
            </p>
            <Link
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white sm:w-auto"
              href="/requests/new"
            >
              Ask what’s true nearby
            </Link>
          </FeedCardBody>
        </FeedCard>
      ) : (
        <DiscoverRequestList
          initialHasMore={result.hasMore}
          initialNextCursor={result.nextCursor}
          initialRequests={result.requests}
          location={locationQuery}
        />
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
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    };
  } catch {
    return {
      ok: false as const,
      requests: [],
      nextCursor: null,
      hasMore: false,
    };
  }
}
