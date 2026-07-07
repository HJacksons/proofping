import { describe, expect, it } from "vitest";

import {
  composeProofReplyBody,
  getProofEvidenceOption,
} from "@/lib/proof-replies/evidence-options";

describe("composeProofReplyBody", () => {
  it("returns the template when no note is provided", () => {
    expect(composeProofReplyBody("From what I know locally, this looks real.")).toBe(
      "From what I know locally, this looks real.",
    );
  });

  it("appends a short optional note", () => {
    expect(
      composeProofReplyBody(
        "From what I know locally, this looks real.",
        "Same sign as the photos.",
      ),
    ).toBe(
      "From what I know locally, this looks real. Same sign as the photos.",
    );
  });
});

describe("getProofEvidenceOption", () => {
  it("finds a quick evidence option by id", () => {
    expect(getProofEvidenceOption("confirmed-open")?.verdict).toBe("CONFIRMED");
  });
});
