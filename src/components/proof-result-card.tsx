import type { AskIntent } from "@/lib/proof-requests/ask-intent";
import type { ProofReplySummary } from "@/lib/proof-replies/summary";

type ProofResultCardProps = {
  summary: ProofReplySummary;
  /** Shapes caution/confirm copy for deal vs right-now asks. */
  intent?: AskIntent;
};

export function ProofResultCard({
  summary,
  intent = "general",
}: ProofResultCardProps) {
  const tone = getResultTone(summary);
  const result = getResultCopy(tone, intent);
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
              Proof card
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
        <span>
          {summary.total} human {summary.total === 1 ? "reply" : "replies"}
        </span>
        <span>{result.footer}</span>
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

function getResultCopy(tone: ResultTone, intent: AskIntent) {
  const styles = resultStyles[tone];

  return {
    ...styles,
    ...resultMessages[tone][intent],
  };
}

const resultStyles: Record<
  ResultTone,
  {
    status: string;
    bg: string;
    border: string;
    text: string;
    pill: string;
  }
> = {
  waiting: {
    status: "Waiting",
    bg: "bg-background",
    border: "border-line",
    text: "text-foreground",
    pill: "border-line bg-surface text-muted",
  },
  trusted: {
    status: "Strong signal",
    bg: "bg-accent-soft",
    border: "border-accent/20",
    text: "text-accent-strong",
    pill: "border-accent/20 bg-surface text-accent-strong",
  },
  caution: {
    status: "Flagged",
    bg: "bg-warn-soft",
    border: "border-amber-200",
    text: "text-amber-950",
    pill: "border-amber-200 bg-surface text-amber-900",
  },
  mixed: {
    status: "Needs more proof",
    bg: "bg-background",
    border: "border-line",
    text: "text-foreground",
    pill: "border-line bg-surface text-foreground",
  },
};

const resultMessages: Record<
  ResultTone,
  Record<AskIntent, { description: string; footer: string }>
> = {
  waiting: {
    deal: {
      description:
        "Share the helper link with someone local or someone who knows the seller. Their replies will build this card.",
      footer: "Human proof before you pay or commit",
    },
    right_now: {
      description:
        "Share with someone who’s already there — queue, door, printer, stall. Their replies will build this card.",
      footer: "Human proof before you go or wait",
    },
    general: {
      description:
        "Share the helper link with someone who’s there or who knows the place. Their replies will build this card.",
      footer: "Human proof before you decide",
    },
  },
  trusted: {
    deal: {
      description:
        "Multiple people confirmed this and nobody flagged a concern. Still use your judgment before you pay or sign.",
      footer: "Human proof before you pay or commit",
    },
    right_now: {
      description:
        "Multiple people confirmed this and nobody flagged a concern. Still double-check if the situation can change by the minute.",
      footer: "Human proof before you go or wait",
    },
    general: {
      description:
        "Multiple people confirmed this and nobody flagged a concern. Still use your judgment before you pay, go, or commit.",
      footer: "Human proof before you decide",
    },
  },
  caution: {
    deal: {
      description:
        "At least one helper flagged a risk. Pause before sending money and ask for stronger proof.",
      footer: "Human proof before you pay or commit",
    },
    right_now: {
      description:
        "At least one helper flagged a problem. Pause before you leave, wait, or change plans — ask for a clearer check.",
      footer: "Human proof before you go or wait",
    },
    general: {
      description:
        "At least one helper flagged a risk. Pause before you pay, go, or commit — ask for stronger proof.",
      footer: "Human proof before you decide",
    },
  },
  mixed: {
    deal: {
      description:
        "You have an early signal, but not enough agreement yet. Share the link with one or two more people before you pay.",
      footer: "Human proof before you pay or commit",
    },
    right_now: {
      description:
        "You have an early signal, but not enough agreement yet. Ask one more person who’s there before you move.",
      footer: "Human proof before you go or wait",
    },
    general: {
      description:
        "You have an early signal, but not enough agreement yet. Share the link with one or two more people.",
      footer: "Human proof before you decide",
    },
  },
};
