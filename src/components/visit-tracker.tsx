"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SKIP_PREFIXES = ["/api", "/_next", "/admin"];

function shouldTrackPath(pathname: string) {
  return !SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !shouldTrackPath(pathname)) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {
      // Analytics should never interrupt browsing.
    });

    return () => {
      controller.abort();
    };
  }, [pathname]);

  return null;
}
