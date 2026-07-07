import type { EvidenceOwnerKind } from "@/generated/prisma/client";

export type RequestEvidenceDTO = {
  id: string;
  requestId: string;
  replyId: string | null;
  ownerKind: EvidenceOwnerKind;
  url: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  createdAt: string;
};
