import { ProofResultBadge } from "@/components/proof-result-badge";
import { ProofStatsRow } from "@/components/proof-stats-row";
import type { ProofReplySummary } from "@/lib/proof-replies/summary";

type ProofResultCardProps = {
  summary: ProofReplySummary;
};

export function ProofResultCard({ summary }: ProofResultCardProps) {
  return (
    <div className="grid gap-2 border-t border-line pt-3">
      <ProofResultBadge summary={summary} />
      <ProofStatsRow summary={summary} />
    </div>
  );
}
