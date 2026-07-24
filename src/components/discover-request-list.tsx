"use client";

import Link from "next/link";
import { useState } from "react";

import { LoadMoreButton } from "@/components/load-more-button";
import { ProofResultBadge } from "@/components/proof-result-badge";
import { ProofStatsRow } from "@/components/proof-stats-row";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { UrgentBadge } from "@/components/urgent-badge";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { getProofRequestCategoryLabel } from "@/lib/proof-requests/categories";
import { getRequestPreviewBody } from "@/lib/proof-requests/preview";
import type { ProofReplySummary } from "@/lib/proof-replies/summary";
import { getProofRequestStatusLabel } from "@/lib/proof-requests/status";

export type DiscoverRequestItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  locationHint: string | null;
  status: string;
  createdAt: string;
  replySummary: ProofReplySummary;
  isUrgentBoosted: boolean;
};

type DiscoverRequestListProps = {
  location: string;
  initialRequests: DiscoverRequestItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

type DiscoverPageResponse = {
  requests?: DiscoverRequestItem[];
  nextCursor: string | null;
  hasMore: boolean;
  error?: string;
};

export function DiscoverRequestList({
  location,
  initialRequests,
  initialNextCursor,
  initialHasMore,
}: DiscoverRequestListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!hasMore || loading || !nextCursor) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (location.trim()) {
        params.set("location", location.trim());
      }

      const response = await fetch(`/api/requests/discover?${params}`);
      const payload = (await response.json()) as DiscoverPageResponse;

      if (!response.ok || !payload.requests) {
        setError(payload.error ?? "Unable to load more asks.");
        return;
      }

      setRequests((current) => [...current, ...payload.requests!]);
      setNextCursor(payload.nextCursor);
      setHasMore(payload.hasMore);
    } catch {
      setError("Unable to load more asks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-3" aria-label="Discoverable proof requests">
      {requests.map((request) => {
        const preview = getRequestPreviewBody(request.body, {
          title: request.title,
        });

        return (
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

              {preview ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/90">
                  {preview}
                </p>
              ) : null}

              <div className="mt-3 grid gap-2 border-t border-line pt-3">
                <ProofResultBadge summary={request.replySummary} />
                <ProofStatsRow summary={request.replySummary} />
              </div>

              <div className="mt-4">
                <Link
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong hover:text-white sm:w-auto"
                  href={`/requests/${request.id}`}
                >
                  Check it · help or learn
                </Link>
              </div>
            </FeedCardBody>
          </FeedCard>
        );
      })}

      <LoadMoreButton
        hasMore={hasMore}
        label="Load more asks"
        loading={loading}
        onClick={() => {
          void loadMore();
        }}
      />

      {error ? (
        <p className="text-center text-sm font-medium text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
