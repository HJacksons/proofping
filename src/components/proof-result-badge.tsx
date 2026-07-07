import type { ProofReplySummary } from "@/lib/proof-replies/summary";

type ProofResultBadgeProps = {
  summary: Pick<
    ProofReplySummary,
    "resultLabel" | "suspicious" | "total" | "confirmed" | "unsure"
  >;
};

export function ProofResultBadge({ summary }: ProofResultBadgeProps) {
  const tone = getResultTone(summary);

  return (
    <p className={`inline-flex items-center gap-1.5 text-sm font-semibold ${toneClasses[tone]}`}>
      <ResultIcon tone={tone} />
      {summary.resultLabel}
    </p>
  );
}

type ResultTone = "waiting" | "trusted" | "caution" | "mixed";

function getResultTone(
  summary: Pick<
    ProofReplySummary,
    "resultLabel" | "suspicious" | "total" | "confirmed" | "unsure"
  >,
): ResultTone {
  if (summary.total === 0) {
    return "waiting";
  }

  if (summary.suspicious > 0) {
    return "caution";
  }

  if (summary.confirmed >= 2 && summary.unsure === 0) {
    return "trusted";
  }

  return "mixed";
}

const toneClasses: Record<ResultTone, string> = {
  waiting: "text-muted",
  trusted: "text-accent-strong",
  caution: "text-amber-800",
  mixed: "text-foreground",
};

function ResultIcon({ tone }: { tone: ResultTone }) {
  if (tone === "trusted") {
    return (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 13.2-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7Z" />
      </svg>
    );
  }

  if (tone === "caution") {
    return (
      <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3 2 20h20L12 3Zm1 14h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z" />
    </svg>
  );
}
