import type { ProofReplyVerdict } from "@/lib/proof-replies/verdicts";

export type ProofEvidenceOption = {
  id: string;
  label: string;
  verdict: ProofReplyVerdict;
  body: string;
};

export const proofEvidenceOptions = [
  {
    id: "confirmed-real",
    label: "Looks real to me",
    verdict: "CONFIRMED",
    body: "From what I know locally, this looks real.",
  },
  {
    id: "confirmed-open",
    label: "I saw it open",
    verdict: "CONFIRMED",
    body: "I checked in person — it is open right now.",
  },
  {
    id: "confirmed-matches",
    label: "Matches the description",
    verdict: "CONFIRMED",
    body: "From what I know, it matches what was described.",
  },
  {
    id: "suspicious-closed",
    label: "Looked closed or empty",
    verdict: "SUSPICIOUS",
    body: "I checked in person — it looked closed or empty.",
  },
  {
    id: "suspicious-missing",
    label: "Couldn't find it",
    verdict: "SUSPICIOUS",
    body: "I looked for this place and could not find it.",
  },
  {
    id: "suspicious-risky",
    label: "Feels risky",
    verdict: "SUSPICIOUS",
    body: "Something about this feels off or risky.",
  },
  {
    id: "unsure-today",
    label: "Can't confirm right now",
    verdict: "UNSURE",
    body: "I could not confirm this right now.",
  },
  {
    id: "unsure-partial",
    label: "Only partial knowledge",
    verdict: "UNSURE",
    body: "I know the area, but only have partial knowledge about this.",
  },
] as const satisfies readonly ProofEvidenceOption[];

export type ProofEvidenceOptionId = (typeof proofEvidenceOptions)[number]["id"];

export function getProofEvidenceOption(id: string) {
  return proofEvidenceOptions.find((option) => option.id === id);
}

export function composeProofReplyBody(template: string, note?: string | null) {
  const trimmedNote = note?.trim();

  if (!trimmedNote) {
    return template;
  }

  return `${template} ${trimmedNote}`;
}
