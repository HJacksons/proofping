import type { ProofReplyVerdict } from "@/lib/proof-replies/verdicts";

export type ProofReplySummary = {
  total: number;
  confirmed: number;
  suspicious: number;
  unsure: number;
  resultLabel: string;
};

export function summarizeProofReplyCounts(
  confirmed: number,
  suspicious: number,
  unsure: number,
): ProofReplySummary {
  const summary = {
    total: confirmed + suspicious + unsure,
    confirmed,
    suspicious,
    unsure,
  };

  return {
    ...summary,
    resultLabel: getProofResultLabel(summary),
  };
}

export function summarizeProofReplies(
  replies: Array<{ verdict: ProofReplyVerdict | string }>,
): ProofReplySummary {
  const summary = replies.reduce(
    (counts, reply) => {
      if (reply.verdict === "CONFIRMED") {
        counts.confirmed += 1;
      } else if (reply.verdict === "SUSPICIOUS") {
        counts.suspicious += 1;
      } else {
        counts.unsure += 1;
      }

      counts.total += 1;
      return counts;
    },
    {
      total: 0,
      confirmed: 0,
      suspicious: 0,
      unsure: 0,
    },
  );

  return {
    ...summary,
    resultLabel: getProofResultLabel(summary),
  };
}

type VerdictGroup = {
  verdict: ProofReplyVerdict | string;
  _count: {
    _all: number;
  };
};

export function summarizeVerdictGroups(groups: VerdictGroup[]): ProofReplySummary {
  let confirmed = 0;
  let suspicious = 0;
  let unsure = 0;

  for (const group of groups) {
    if (group.verdict === "CONFIRMED") {
      confirmed += group._count._all;
    } else if (group.verdict === "SUSPICIOUS") {
      suspicious += group._count._all;
    } else {
      unsure += group._count._all;
    }
  }

  return summarizeProofReplyCounts(confirmed, suspicious, unsure);
}

export function buildReplySummariesByRequestId(
  groups: Array<VerdictGroup & { requestId: string }>,
): Map<string, ProofReplySummary> {
  const grouped = new Map<string, VerdictGroup[]>();

  for (const group of groups) {
    const existing = grouped.get(group.requestId) ?? [];
    existing.push(group);
    grouped.set(group.requestId, existing);
  }

  const summaries = new Map<string, ProofReplySummary>();

  for (const [requestId, requestGroups] of grouped) {
    summaries.set(requestId, summarizeVerdictGroups(requestGroups));
  }

  return summaries;
}

function getProofResultLabel(summary: Omit<ProofReplySummary, "resultLabel">) {
  if (summary.total === 0) {
    return "Waiting for replies";
  }

  if (summary.suspicious > 0) {
    return "Be careful before paying";
  }

  if (summary.confirmed >= 2 && summary.unsure === 0) {
    return "2 people confirmed";
  }

  if (summary.confirmed === 1 && summary.unsure === 0) {
    return "1 early signal";
  }

  if (summary.confirmed > 0) {
    return "Partly confirmed";
  }

  return "More proof needed";
}
