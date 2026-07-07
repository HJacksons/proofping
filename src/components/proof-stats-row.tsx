import type { ProofReplySummary } from "@/lib/proof-replies/summary";

type ProofStatsRowProps = {
  summary: Pick<
    ProofReplySummary,
    "total" | "confirmed" | "suspicious" | "unsure"
  >;
};

const statItems = [
  { key: "confirmed", label: "confirmed", Icon: ConfirmedIcon },
  { key: "suspicious", label: "suspicious", Icon: SuspiciousIcon },
  { key: "unsure", label: "unsure", Icon: UnsureIcon },
  { key: "total", label: "replies", Icon: RepliesIcon },
] as const;

export function ProofStatsRow({ summary }: ProofStatsRowProps) {
  return (
    <div
      aria-label="Reply summary"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"
      role="list"
    >
      {statItems.map(({ key, label, Icon }) => {
        const value = summary[key];

        if (value === 0) {
          return null;
        }

        return (
          <span className="inline-flex items-center gap-1" key={key} role="listitem">
            <Icon />
            <span className="font-semibold text-foreground">{value}</span>
            <span>{label}</span>
          </span>
        );
      })}
      {summary.total === 0 ? <span>No replies yet</span> : null}
    </div>
  );
}

function RepliesIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-muted" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H6a2 2 0 0 1-2-2V5Z" />
    </svg>
  );
}

function ConfirmedIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 13.2-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7Z" />
    </svg>
  );
}

function SuspiciousIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3 2 20h20L12 3Zm1 14h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
    </svg>
  );
}

function UnsureIcon() {
  return (
    <svg aria-hidden="true" className="size-4 text-muted" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z" />
    </svg>
  );
}
