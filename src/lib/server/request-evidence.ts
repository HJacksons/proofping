import "server-only";

import type { EvidenceOwnerKind, RequestEvidence } from "@/generated/prisma/client";
import type { RequestEvidenceDTO } from "@/lib/evidence/types";
import {
  isAllowedEvidenceMimeType,
  validateEvidenceFile,
  validateEvidenceFileCount,
} from "@/lib/evidence/validation";
import {
  buildEvidenceStorageKey,
  saveEvidenceFile,
} from "@/lib/server/evidence-storage";
import { prisma } from "@/lib/server/db";

export type { RequestEvidenceDTO } from "@/lib/evidence/types";

export class EvidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceValidationError";
  }
}

export function toRequestEvidenceDTO(
  evidence: RequestEvidence,
): RequestEvidenceDTO {
  return {
    id: evidence.id,
    requestId: evidence.requestId,
    replyId: evidence.replyId,
    ownerKind: evidence.ownerKind,
    url: `/api/evidence/${evidence.id}`,
    mimeType: evidence.mimeType,
    originalName: evidence.originalName,
    sizeBytes: evidence.sizeBytes,
    createdAt: evidence.createdAt.toISOString(),
  };
}

export async function saveRequestEvidenceFiles(
  requestId: string,
  replyId: string | null,
  ownerKind: EvidenceOwnerKind,
  files: File[],
) {
  const countError = validateEvidenceFileCount(files.length, ownerKind);

  if (countError) {
    throw new EvidenceValidationError(countError);
  }

  if (files.length === 0) {
    return [];
  }

  const savedEvidence: RequestEvidenceDTO[] = [];

  for (const file of files) {
    const mimeType = file.type || "application/octet-stream";
    const fileError = validateEvidenceFile({
      mimeType,
      sizeBytes: file.size,
    });

    if (fileError) {
      throw new EvidenceValidationError(fileError);
    }

    if (!isAllowedEvidenceMimeType(mimeType)) {
      throw new EvidenceValidationError("Only JPEG, PNG, and WebP photos are allowed.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = buildEvidenceStorageKey(mimeType);

    await saveEvidenceFile({
      storageKey,
      mimeType,
      originalName: sanitizeOriginalName(file.name),
      sizeBytes: file.size,
      buffer,
    });

    const evidence = await prisma.requestEvidence.create({
      data: {
        requestId,
        replyId,
        ownerKind,
        storageKey,
        mimeType,
        originalName: sanitizeOriginalName(file.name),
        sizeBytes: file.size,
      },
    });

    savedEvidence.push(toRequestEvidenceDTO(evidence));
  }

  return savedEvidence;
}

export async function getRequestEvidenceForPublicRequest(requestId: string) {
  const evidence = await prisma.requestEvidence.findMany({
    where: {
      requestId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return evidence.map(toRequestEvidenceDTO);
}

export async function getPublicEvidenceById(id: string) {
  return prisma.requestEvidence.findUnique({
    where: {
      id,
    },
  });
}

function sanitizeOriginalName(name: string) {
  const baseName = name.split(/[/\\]/).pop() ?? "photo";

  return baseName.replace(/[^\w.\- ()]/g, "_").slice(0, 160) || "photo";
}

export function extractAttachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);
}
