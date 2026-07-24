import { describe, expect, it } from "vitest";

import { buildSharePayload } from "@/lib/proof-requests/share-message";

describe("buildSharePayload", () => {
  it("shares a hook, the question, and a ProofPing CTA", () => {
    expect(
      buildSharePayload(
        "Is this listing real?",
        "https://proofping.test/requests/abc?reply=token",
      ),
    ).toBe(
      [
        "Can you check this right now?",
        "Is this listing real?",
        "30-sec reply on ProofPing:\nhttps://proofping.test/requests/abc?reply=token",
      ].join("\n\n"),
    );
  });

  it("puts the note first, then the viral share body", () => {
    expect(
      buildSharePayload(
        "Is this address correct?",
        "https://proofping.test/requests/abc?reply=token",
        "This is note",
      ),
    ).toBe(
      [
        "This is note",
        "Can you check this right now?",
        "Is this address correct?",
        "30-sec reply on ProofPing:\nhttps://proofping.test/requests/abc?reply=token",
      ].join("\n\n"),
    );
  });

  it("uses an urgent hook when the ask is boosted", () => {
    expect(
      buildSharePayload(
        "Is this listing real?",
        "https://proofping.test/requests/abc?reply=token",
        null,
        true,
      ),
    ).toBe(
      [
        "Need eyes on this NOW.",
        "Is this listing real?",
        "30-sec reply on ProofPing:\nhttps://proofping.test/requests/abc?reply=token",
      ].join("\n\n"),
    );
  });
});
