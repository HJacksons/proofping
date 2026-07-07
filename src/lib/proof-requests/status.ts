export const proofRequestStatusValues = [
  "OPEN",
  "SOLVED",
  "SUSPICIOUS",
  "UNRESOLVED",
  "CLOSED",
] as const;

export type ProofRequestStatus = (typeof proofRequestStatusValues)[number];

const statusLabels: Record<ProofRequestStatus, string> = {
  OPEN: "Open",
  SOLVED: "Solved",
  SUSPICIOUS: "Suspicious",
  UNRESOLVED: "Unresolved",
  CLOSED: "Closed",
};

export function getProofRequestStatusLabel(status: string) {
  if (isProofRequestStatus(status)) {
    return statusLabels[status];
  }

  return status.toLowerCase();
}

export function isProofRequestStatus(status: string): status is ProofRequestStatus {
  return proofRequestStatusValues.includes(status as ProofRequestStatus);
}

export function canAcceptReplies(status: string) {
  return status === "OPEN" || status === "UNRESOLVED" || status === "SUSPICIOUS";
}
