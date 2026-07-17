import { canAcceptReplies } from "@/lib/proof-requests/status";

export const proofRequestVisibilityValues = [
  "PRIVATE_LINK",
  "LOCAL_DISCOVERY",
] as const;

export type ProofRequestVisibility = (typeof proofRequestVisibilityValues)[number];

const visibilityLabels: Record<ProofRequestVisibility, string> = {
  PRIVATE_LINK: "Private link",
  LOCAL_DISCOVERY: "Help nearby",
};

export function getProofRequestVisibilityLabel(visibility: string) {
  if (isProofRequestVisibility(visibility)) {
    return visibilityLabels[visibility];
  }

  return visibility;
}

export function isProofRequestVisibility(
  visibility: string,
): visibility is ProofRequestVisibility {
  return proofRequestVisibilityValues.includes(
    visibility as ProofRequestVisibility,
  );
}

export function canReplyThroughDiscovery(request: {
  visibility: string;
  status: string;
}) {
  return request.visibility === "LOCAL_DISCOVERY" && canAcceptReplies(request.status);
}
