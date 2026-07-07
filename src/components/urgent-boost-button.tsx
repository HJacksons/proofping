"use client";

import { useId, useState } from "react";

import { ReplySignalRow } from "@/components/reply-signal-row";
import { UrgentBadge } from "@/components/urgent-badge";

const boostBenefits = [
  "Urgent badge when someone opens your link",
  '"Urgent:" added when you share',
  "Reply momentum tracker on your request",
] as const;

type UrgentBoostButtonProps = {
  requestId: string;
  enabled: boolean;
  isBoosted: boolean;
  canBoost: boolean;
  replyCount: number;
};

function InfoIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 14h-2v-5h2v5Zm0-7h-2V7h2v2Z" />
    </svg>
  );
}

function BoostInfoPopover({ id, open }: { id: string; open: boolean }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="absolute bottom-full right-0 z-10 mb-2 w-56 rounded-md border border-line bg-surface p-3 text-left shadow-lg"
      id={id}
      role="tooltip"
    >
      <ul className="grid gap-1.5 text-xs leading-5 text-muted">
        {boostBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </div>
  );
}

export function UrgentBoostButton({
  requestId,
  enabled,
  isBoosted,
  canBoost,
  replyCount,
}: UrgentBoostButtonProps) {
  const infoId = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  async function startBoost() {
    if (!enabled || !canBoost || isBoosted || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/boost`, {
        method: "POST",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Urgent boost is not available right now.");
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError("Urgent boost is not available right now.");
    } finally {
      setLoading(false);
    }
  }

  if (isBoosted) {
    return (
      <div className="grid gap-3 border-t border-line px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <UrgentBadge />
          <span className="text-sm font-semibold text-foreground">Boost active</span>
        </div>
        <ReplySignalRow replyCount={replyCount} />
      </div>
    );
  }

  if (!enabled || !canBoost) {
    return null;
  }

  return (
    <div className="border-t border-line px-4 py-3">
      <div className="flex items-stretch gap-2">
        <button
          className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-md border border-line bg-background text-sm font-semibold text-foreground hover:bg-foreground/5 disabled:opacity-60"
          disabled={loading}
          onClick={() => {
            void startBoost();
          }}
          type="button"
        >
          {loading ? "Opening checkout..." : "Boost this request"}
        </button>

        <div
          className="relative shrink-0"
          onMouseEnter={() => setInfoOpen(true)}
          onMouseLeave={() => setInfoOpen(false)}
        >
          <button
            aria-describedby={infoOpen ? infoId : undefined}
            aria-expanded={infoOpen}
            aria-label="What does boost include?"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-background text-muted transition hover:bg-foreground/5 hover:text-foreground"
            onClick={() => setInfoOpen((open) => !open)}
            type="button"
          >
            <InfoIcon />
          </button>
          <BoostInfoPopover id={infoId} open={infoOpen} />
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-center text-xs text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
