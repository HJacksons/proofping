"use client";

import { useState } from "react";

type DonateButtonProps = {
  enabled: boolean;
};

function HeartIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21s-6.7-4.35-9.33-8.03C.5 9.66 2.5 5.5 6.4 5.5c2.04 0 3.27 1.18 3.8 2.17.53-.99 1.76-2.17 3.8-2.17 3.9 0 5.9 4.16 3.73 7.47C18.7 16.65 12 21 12 21Z" />
    </svg>
  );
}

export function DonateButton({ enabled }: DonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startDonation() {
    if (!enabled || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/donate", {
        method: "POST",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Donations are not available right now.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("Donations are not available right now.");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return null;
  }

  return (
    <div className="grid gap-1">
      <button
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-background px-3.5 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent-strong disabled:opacity-60"
        disabled={loading}
        onClick={() => {
          void startDonation();
        }}
        type="button"
      >
        <HeartIcon />
        {loading ? "Opening..." : "Donate"}
      </button>
      {error ? (
        <p className="text-xs text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
