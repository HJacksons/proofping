import { describe, expect, it } from "vitest";

import { buildSharePayload } from "@/lib/proof-requests/share-message";

describe("buildSharePayload", () => {
  it("shares the question and link", () => {
    expect(
      buildSharePayload(
        "Is this listing real?",
        "https://proofping.test/requests/abc?reply=token",
      ),
    ).toBe(
      "Is this listing real?\nhttps://proofping.test/requests/abc?reply=token",
    );
  });

  it("puts the note first, then the question and link", () => {
    expect(
      buildSharePayload(
        "Is this address correct?",
        "https://proofping.test/requests/abc?reply=token",
        "This is note",
      ),
    ).toBe(
      "This is note\n\nIs this address correct?\nhttps://proofping.test/requests/abc?reply=token",
    );
  });

  it("prefixes urgent requests in the share text", () => {
    expect(
      buildSharePayload(
        "Is this listing real?",
        "https://proofping.test/requests/abc?reply=token",
        null,
        true,
      ),
    ).toBe(
      "Urgent: Is this listing real?\nhttps://proofping.test/requests/abc?reply=token",
    );
  });
});
