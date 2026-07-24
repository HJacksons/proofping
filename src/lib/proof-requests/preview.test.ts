import { describe, expect, it } from "vitest";

import { getRequestPreviewBody } from "@/lib/proof-requests/preview";

describe("getRequestPreviewBody", () => {
  it("strips create-form boilerplate", () => {
    const body = [
      "I need help verifying: is the place olay",
      "Location: Makerere Kikoni",
      "Link: https://github.com/HJacksons/proofping",
      "sssdsads",
    ].join("\n\n");

    expect(
      getRequestPreviewBody(body, { title: "is the place olay" }),
    ).toBe("sssdsads");
  });

  it("returns null when only boilerplate remains", () => {
    const body = [
      "I need help verifying: How long is the queue?",
      "Location: West gate",
      "Please check what you can and reply honestly.",
    ].join("\n\n");

    expect(
      getRequestPreviewBody(body, { title: "How long is the queue?" }),
    ).toBeNull();
  });

  it("keeps useful details", () => {
    expect(
      getRequestPreviewBody(
        "Which printer by the stairs? The big one was jammed yesterday.",
        { title: "Is the library printer working?" },
      ),
    ).toBe("Which printer by the stairs? The big one was jammed yesterday.");
  });
});
