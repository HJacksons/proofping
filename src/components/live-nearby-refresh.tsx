"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type LiveNearbyRefreshProps = {
  location: string;
  /** ISO timestamp of the newest ask currently shown */
  latestCreatedAt?: string | null;
  intervalMs?: number;
};

export function LiveNearbyRefresh({
  location,
  latestCreatedAt = null,
  intervalMs = 12_000,
}: LiveNearbyRefreshProps) {
  const router = useRouter();
  const sinceRef = useRef(latestCreatedAt);

  useEffect(() => {
    sinceRef.current = latestCreatedAt;
  }, [latestCreatedAt]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const since = sinceRef.current;
      if (!since) {
        return;
      }

      const params = new URLSearchParams({ since });
      if (location.trim()) {
        params.set("location", location.trim());
      }

      try {
        const response = await fetch(`/api/requests/discover?${params.toString()}`);
        const payload = (await response.json()) as {
          hasNew?: boolean;
          latestCreatedAt?: string | null;
        };

        if (cancelled || !response.ok) {
          return;
        }

        if (payload.hasNew) {
          if (payload.latestCreatedAt) {
            sinceRef.current = payload.latestCreatedAt;
          }
          router.refresh();
        }
      } catch {
        // Ignore transient poll errors.
      }
    }

    const timer = window.setInterval(() => {
      void poll();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [intervalMs, location, router]);

  return null;
}
