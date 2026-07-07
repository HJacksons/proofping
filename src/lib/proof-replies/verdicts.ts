export const proofReplyVerdicts = [
  {
    value: "CONFIRMED",
    label: "Confirmed",
    description: "What I know or checked supports this.",
  },
  {
    value: "SUSPICIOUS",
    label: "Suspicious",
    description: "Something looks wrong, missing, closed, or risky.",
  },
  {
    value: "UNSURE",
    label: "Unsure",
    description: "I can share context, but cannot fully confirm.",
  },
] as const;

export type ProofReplyVerdict = (typeof proofReplyVerdicts)[number]["value"];

export const proofReplyVerdictValues = [
  "CONFIRMED",
  "SUSPICIOUS",
  "UNSURE",
] as const;

export function getProofReplyVerdictLabel(verdict: string): string {
  return (
    proofReplyVerdicts.find((item) => item.value === verdict)?.label ?? "Unsure"
  );
}
