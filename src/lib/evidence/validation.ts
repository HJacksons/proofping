export const MAX_EVIDENCE_FILES_PER_REQUEST = 2;
export const MAX_EVIDENCE_FILES_PER_REPLY = 2;
export const MAX_EVIDENCE_FILE_BYTES = 8 * 1024 * 1024;

export const allowedEvidenceMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedEvidenceMimeType = (typeof allowedEvidenceMimeTypes)[number];

export function isAllowedEvidenceMimeType(
  mimeType: string,
): mimeType is AllowedEvidenceMimeType {
  return allowedEvidenceMimeTypes.includes(mimeType as AllowedEvidenceMimeType);
}

export function validateEvidenceFileCount(
  count: number,
  ownerKind: "REQUEST" | "REPLY",
): string | null {
  const max =
    ownerKind === "REQUEST"
      ? MAX_EVIDENCE_FILES_PER_REQUEST
      : MAX_EVIDENCE_FILES_PER_REPLY;

  if (count > max) {
    return `You can attach up to ${max} photos.`;
  }

  return null;
}

export function validateEvidenceFile(file: {
  mimeType: string;
  sizeBytes: number;
}): string | null {
  if (!isAllowedEvidenceMimeType(file.mimeType)) {
    return "Only JPEG, PNG, and WebP photos are allowed.";
  }

  if (file.sizeBytes > MAX_EVIDENCE_FILE_BYTES) {
    return "Each photo must be 8 MB or smaller.";
  }

  if (file.sizeBytes <= 0) {
    return "The photo file is empty.";
  }

  return null;
}

export function getEvidenceExtension(mimeType: AllowedEvidenceMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}
