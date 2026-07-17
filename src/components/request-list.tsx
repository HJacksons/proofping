"use client";

import Link from "next/link";
import { useState } from "react";

import { LoadMoreButton } from "@/components/load-more-button";
import { ProofResultBadge } from "@/components/proof-result-badge";
import { ProofStatsRow } from "@/components/proof-stats-row";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { ShareProofButton } from "@/components/share-proof-button";
import { UrgentBadge } from "@/components/urgent-badge";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { getProofRequestCategoryLabel } from "@/lib/proof-requests/categories";
import type { ProofReplySummary } from "@/lib/proof-replies/summary";
import { canAcceptReplies, getProofRequestStatusLabel } from "@/lib/proof-requests/status";

export type RequestListItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  locationHint: string | null;
  visibility: string;
  status: string;
  createdAt: string;
  replyShareUrl: string | null;
  replySummary: ProofReplySummary;
  isUrgentBoosted: boolean;
};

type RequestListProps = {
  initialRequests: RequestListItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

type RequestsPageResponse = {
  requests: RequestListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function RequestList({
  initialRequests,
  initialNextCursor,
  initialHasMore,
}: RequestListProps) {
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
      const response = await fetch(
        `/api/requests?cursor=${encodeURIComponent(nextCursor)}`,
      );
      const payload = (await response.json()) as RequestsPageResponse & {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to load more requests.");
        return;
      }

      setRequests((current) => [...current, ...payload.requests]);
      setNextCursor(payload.nextCursor);
      setHasMore(payload.hasMore);
    } catch {
      setError("Unable to load more requests.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <FeedCard key={request.id}>
          <FeedCardBody>
            <div className="flex items-start justify-between gap-3">
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
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted">
                    {getProofRequestStatusLabel(request.status)}
                    {" · "}
                    <ProofTimestamp value={request.createdAt} />
                  </p>
                  {request.isUrgentBoosted ? <UrgentBadge /> : null}
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2 border-t border-line pt-3">
              <ProofResultBadge summary={request.replySummary} />
              <ProofStatsRow summary={request.replySummary} />
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/90">
              {request.body}
            </p>
          </FeedCardBody>

          {request.replyShareUrl ? (
            <ShareProofButton
              disabled={!canAcceptReplies(request.status)}
              shareUrl={request.replyShareUrl}
              title={request.title}
            />
          ) : null}
        </FeedCard>
      ))}

      <LoadMoreButton
        hasMore={hasMore}
        label="Load more requests"
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
    </div>
  );
}
