"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  baselineNearbyAlertSince,
  buildNearbyDeviceAlertCopy,
  readLocalNearbyAlertPrefs,
  readNearbyAlertSince,
  showDeviceNotification,
  writeNearbyAlertSince,
} from "@/lib/nearby-alerts/device-notify";

type NearbyToast = {
  id: string;
  title: string;
  locationHint: string;
  href: string;
};

type DiscoverPollPayload = {
  hasNew?: boolean;
  latestCreatedAt?: string | null;
  newest?: {
    id: string;
    title: string;
    locationHint: string | null;
    isUrgentBoosted?: boolean;
    createdAt: string;
  } | null;
};

const POLL_MS = 10_000;

export function NearbyDeviceAlerts() {
  const router = useRouter();
  const pathname = usePathname();
  const [toast, setToast] = useState<NearbyToast | null>(null);

  useEffect(() => {
    let cancelled = false;
    let watchLocation: string | null = null;
    let timer: number | null = null;

    async function loadPrefs() {
      const local = readLocalNearbyAlertPrefs();
      if (local?.enabled && local.location) {
        watchLocation = local.location;
        if (!readNearbyAlertSince()) {
          baselineNearbyAlertSince();
        }
        return;
      }

      watchLocation = null;
    }

    async function poll() {
      if (!watchLocation) {
        return;
      }

      const since = readNearbyAlertSince();
      if (!since) {
        return;
      }

      const params = new URLSearchParams({
        since,
        location: watchLocation,
      });

      try {
        const response = await fetch(`/api/requests/discover?${params}`);
        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as DiscoverPollPayload;
        if (!payload.hasNew || !payload.newest) {
          if (payload.latestCreatedAt) {
            writeNearbyAlertSince(payload.latestCreatedAt);
          }
          return;
        }

        const newest = payload.newest;
        writeNearbyAlertSince(newest.createdAt);

        const href = `/requests/${newest.id}`;
        const copy = buildNearbyDeviceAlertCopy({
          title: newest.title,
          locationHint: newest.locationHint ?? watchLocation,
          urgent: Boolean(newest.isUrgentBoosted),
        });

        showDeviceNotification({
          title: copy.title,
          body: copy.body,
          url: href,
          tag: `nearby-${newest.id}`,
        });

        setToast({
          id: newest.id,
          title: newest.title,
          locationHint: newest.locationHint ?? watchLocation,
          href,
        });

        if (pathname === "/requests") {
          router.refresh();
        }
      } catch {
        // Ignore transient poll errors.
      }
    }

    void loadPrefs();
    void poll();
    timer = window.setInterval(() => {
      void poll();
    }, POLL_MS);

    function onPrefsChanged() {
      loadPrefs();
      void poll();
    }

    window.addEventListener("proofping:nearby-alerts-changed", onPrefsChanged);

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearInterval(timer);
      }
      window.removeEventListener(
        "proofping:nearby-alerts-changed",
        onPrefsChanged,
      );
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 12_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-3 sticky-above-nav"
      role="status"
    >
      <div className="mb-3 flex w-full max-w-md items-start gap-3 rounded-md border border-line bg-surface p-3 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
            Nearby — help or learn
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug">{toast.title}</p>
          <p className="mt-0.5 text-xs text-muted">{toast.locationHint}</p>
        </div>
        <div className="grid shrink-0 gap-1">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-strong"
            href={toast.href}
            onClick={() => setToast(null)}
          >
            Open
          </Link>
          <button
            className="min-h-9 text-xs font-semibold text-muted hover:text-foreground"
            onClick={() => setToast(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
