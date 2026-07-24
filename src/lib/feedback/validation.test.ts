import { describe, expect, it } from "vitest";

import { createProductFeedbackSchema } from "@/lib/feedback/validation";

describe("createProductFeedbackSchema", () => {
  it("allows all_good without a message", () => {
    expect(
      createProductFeedbackSchema.parse({
        category: "all_good",
        message: "",
      }),
    ).toMatchObject({ category: "all_good" });
  });

  it("requires a short note for broken/confusing/idea", () => {
    expect(() =>
      createProductFeedbackSchema.parse({
        category: "broken",
        message: "no",
      }),
    ).toThrow();

    expect(
      createProductFeedbackSchema.parse({
        category: "idea",
        message: "Show queue wait estimates on Help nearby.",
        path: "/requests/new",
        requestId: "req-1",
      }),
    ).toMatchObject({
      category: "idea",
      requestId: "req-1",
    });
  });
});
