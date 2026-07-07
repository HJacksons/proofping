import { describe, expect, it } from "vitest";

import {
  MAX_EVIDENCE_FILES_PER_REPLY,
  MAX_EVIDENCE_FILES_PER_REQUEST,
  validateEvidenceFile,
  validateEvidenceFileCount,
} from "@/lib/evidence/validation";

describe("validateEvidenceFileCount", () => {
  it("allows up to two requester photos", () => {
    expect(validateEvidenceFileCount(2, "REQUEST")).toBeNull();
    expect(validateEvidenceFileCount(MAX_EVIDENCE_FILES_PER_REQUEST, "REQUEST")).toBeNull();
  });

  it("allows up to two reply photos", () => {
    expect(validateEvidenceFileCount(2, "REPLY")).toBeNull();
    expect(validateEvidenceFileCount(MAX_EVIDENCE_FILES_PER_REPLY, "REPLY")).toBeNull();
  });

  it("rejects more than two photos", () => {
    expect(validateEvidenceFileCount(3, "REQUEST")).toContain("2");
    expect(validateEvidenceFileCount(3, "REPLY")).toContain("2");
  });
});

describe("validateEvidenceFile", () => {
  it("accepts allowed image types within size limits", () => {
    expect(
      validateEvidenceFile({
        mimeType: "image/jpeg",
        sizeBytes: 1024,
      }),
    ).toBeNull();
  });

  it("rejects unsupported file types", () => {
    expect(
      validateEvidenceFile({
        mimeType: "application/pdf",
        sizeBytes: 1024,
      }),
    ).toContain("JPEG");
  });

  it("rejects oversized files", () => {
    expect(
      validateEvidenceFile({
        mimeType: "image/png",
        sizeBytes: 9 * 1024 * 1024,
      }),
    ).toContain("8 MB");
  });
});
