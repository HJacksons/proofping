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
          <p className="text-sm text-muted">No replies yet.</p>
        </FeedCardBody>
      </FeedCard>
    );
  }

  return (
    <div className="grid gap-2">
      {repliesTotal > replies.length ? (
        <p className="px-1 text-xs text-muted">
          Showing {replies.length} of {repliesTotal} replies
        </p>
      ) : null}

      {replies.map((reply) => (
        <FeedCard key={reply.id}>
          <FeedCardBody>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                <AnonymousDisplayName name={reply.displayName} />
                <span aria-hidden="true" className="text-sm text-muted/70">
                  ·
                </span>
                <span className="text-sm font-semibold text-accent-strong">
                  {getProofReplyVerdictLabel(reply.verdict)}
                </span>
              </div>
              <ProofTimestamp className="text-xs text-muted" value={reply.createdAt} />
            </div>
            <p className="mt-2 text-sm leading-6">{reply.body}</p>
            {reply.evidence.length > 0 ? (
              <div className="mt-3">
                <EvidenceGallery evidence={reply.evidence} title="Photos" />
              </div>
            ) : null}
          </FeedCardBody>
        </FeedCard>
      ))}

      <LoadMoreButton
        hasMore={hasMore}
        label="Show older replies"
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
