"use client";

import { useState } from "react";

import { AnonymousDisplayName } from "@/components/anonymous-display-name";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { LoadMoreButton } from "@/components/load-more-button";
import { ProofTimestamp } from "@/components/proof-timestamp";
import { FeedCard, FeedCardBody } from "@/components/ui/feed-card";
import { getProofReplyVerdictLabel } from "@/lib/proof-replies/verdicts";
import type { RequestEvidenceDTO } from "@/lib/evidence/types";

export type ReplyListItem = {
  id: string;
  displayName: string;
  body: string;
  verdict: string;
  createdAt: string;
  evidence: RequestEvidenceDTO[];
};

type ReplyListProps = {
  requestId: string;
  initialReplies: ReplyListItem[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  repliesTotal: number;
};

type RepliesPageResponse = {
  replies: ReplyListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function ReplyList({
  requestId,
  initialReplies,
  initialNextCursor,
  initialHasMore,
  repliesTotal,
}: ReplyListProps) {
  const [replies, setReplies] = useState(initialReplies);
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
        `/api/requests/${requestId}/replies?cursor=${encodeURIComponent(nextCursor)}`,
      );
      const payload = (await response.json()) as RepliesPageResponse & {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to load more replies.");
        return;
      }

      setReplies((current) => [...current, ...payload.replies]);
      setNextCursor(payload.nextCursor);
      setHasMore(payload.hasMore);
    } catch {
      setError("Unable to load more replies.");
    } finally {
      setLoading(false);
    }
  }

  if (replies.length === 0) {
    return (
      <FeedCard>
        <FeedCardBody>
          <p className="text-sm font-medium">No proof cards yet</p>
          <p className="mt-1 text-sm text-muted">
            Share the helper link — or open it nearby so someone already there
            can send the first proof.
          </p>
        </FeedCardBody>
      </FeedCard>
    );
  }

  return (
    <div className="grid gap-2">
      {repliesTotal > replies.length ? (
        <p className="px-1 text-xs text-muted">
          Showing {replies.length} of {repliesTotal} proof cards
        </p>
      ) : (
        <p className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Proof cards
        </p>
      )}

      {replies.map((reply) => (
        <FeedCard key={reply.id}>
          <FeedCardBody>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Proof
                </p>
                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                  <AnonymousDisplayName name={reply.displayName} />
                  <span aria-hidden="true" className="text-sm text-muted/70">
                    ·
                  </span>
                  <span className="text-sm font-semibold text-accent-strong">
                    {getProofReplyVerdictLabel(reply.verdict)}
                  </span>
                </div>
              </div>
              <ProofTimestamp
                className="shrink-0 text-xs font-medium text-muted"
                prefix="Proven"
                value={reply.createdAt}
              />
            </div>
            <p className="mt-2 text-sm leading-6">{reply.body}</p>
            {reply.evidence.length > 0 ? (
              <div className="mt-3">
                <EvidenceGallery evidence={reply.evidence} title="Evidence" />
              </div>
            ) : null}
          </FeedCardBody>
        </FeedCard>
      ))}

      <LoadMoreButton
        hasMore={hasMore}
        label="Show older proof cards"
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
