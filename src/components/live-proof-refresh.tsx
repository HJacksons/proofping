"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type LiveProofRefreshProps = {
  requestId: string;
  replyCount: number;
  intervalMs?: number;
};

export function LiveProofRefresh({
  requestId,
  replyCount,
  intervalMs = 10_000,
}: LiveProofRefreshProps) {
  const router = useRouter();
  const countRef = useRef(replyCount);

  useEffect(() => {
    countRef.current = replyCount;
  }, [replyCount]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/requests/${requestId}`);
          if (!response.ok || cancelled) {
            return;
          }

          const payload = (await response.json()) as {
            request?: { replySummary?: { total?: number } };
          };
          const nextTotal = payload.request?.replySummary?.total;

          if (
            typeof nextTotal === "number" &&
            nextTotal !== countRef.current
          ) {
            countRef.current = nextTotal;
            router.refresh();
          }
        } catch {
          // Ignore transient poll errors.
        }
      })();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [intervalMs, requestId, router]);

  return null;
}
