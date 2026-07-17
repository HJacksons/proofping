import type { ProofReplySummary } from "@/lib/proof-replies/summary";

type ProofResultCardProps = {
  summary: ProofReplySummary;
};

export function ProofResultCard({ summary }: ProofResultCardProps) {
  const tone = getResultTone(summary);
  const result = resultCopy[tone];
  const stats = [
    { label: "Confirmed", value: summary.confirmed },
    { label: "Suspicious", value: summary.suspicious },
    { label: "Unsure", value: summary.unsure },
  ];

  return (
    <section className={`mt-5 overflow-hidden rounded-md border ${result.border} ${result.bg}`}>
      <div className="grid gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              ProofPing check
            </p>
            <h2 className={`mt-2 text-2xl font-bold leading-tight ${result.text}`}>
              {summary.resultLabel}
            </h2>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${result.pill}`}
          >
            {result.status}
          </span>
        </div>

        <p className="max-w-xl text-sm leading-6 text-muted">{result.description}</p>

        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-line bg-surface text-center">
          {stats.map((stat) => (
            <div className="border-r border-line px-3 py-3 last:border-r-0" key={stat.label}>
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface/75 px-4 py-3 text-xs font-medium text-muted sm:px-5">
        <span>{summary.total} human {summary.total === 1 ? "reply" : "replies"}</span>
        <span>Real checks before money changes hands</span>
      </div>
    </section>
  );
}

type ResultTone = "waiting" | "trusted" | "caution" | "mixed";

function getResultTone(summary: ProofReplySummary): ResultTone {
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

const resultCopy: Record<
  ResultTone,
  {
    status: string;
    description: string;
    bg: string;
    border: string;
    text: string;
    pill: string;
  }
> = {
  waiting: {
    status: "Waiting",
    description:
      "Share the helper link with someone local or someone who knows the seller. Their replies will build this card.",
    bg: "bg-background",
    border: "border-line",
    text: "text-foreground",
    pill: "border-line bg-surface text-muted",
  },
  trusted: {
    status: "Verified signal",
    description:
      "Multiple people confirmed this and nobody flagged a concern. Still use judgment before paying.",
    bg: "bg-accent-soft",
    border: "border-accent/20",
    text: "text-accent-strong",
    pill: "border-accent/20 bg-surface text-accent-strong",
  },
  caution: {
    status: "Suspicious",
    description:
      "At least one helper flagged a risk. Pause before sending money and ask for stronger proof.",
    bg: "bg-warn-soft",
    border: "border-amber-200",
    text: "text-amber-950",
    pill: "border-amber-200 bg-surface text-amber-900",
  },
  mixed: {
    status: "Needs more proof",
    description:
      "You have an early signal, but not enough agreement yet. Share the link with one or two more people.",
    bg: "bg-background",
    border: "border-line",
    text: "text-foreground",
    pill: "border-line bg-surface text-foreground",
  },
};
