import { describe, expect, it } from "vitest";

import { createProofReplySchema } from "@/lib/proof-replies/validation";

describe("createProofReplySchema", () => {
  it("accepts and trims a useful public reply", () => {
    const parsed = createProofReplySchema.parse({
      helperName: "  A neighbor nearby  ",
      verdict: "CONFIRMED",
      body: "  I walked past the shop today and it was open with the same sign outside.  ",
    });

    expect(parsed).toEqual({
      helperName: "A neighbor nearby",
      verdict: "CONFIRMED",
      body: "I walked past the shop today and it was open with the same sign outside.",
    });
  });

  it("allows anonymous helpers", () => {
    const parsed = createProofReplySchema.parse({
      helperName: "",
      verdict: "UNSURE",
      body: "I know the area, but I cannot fully confirm this exact listing today.",
    });

    expect(parsed.helperName).toBeNull();
  });

  it("accepts multipart form values with null helperName", () => {
    const parsed = createProofReplySchema.parse({
      helperName: null,
      verdict: "CONFIRMED",
      body: "From what I know locally, this looks real.",
    });

    expect(parsed.helperName).toBeNull();
  });

  it("rejects replies that are too vague", () => {
    const result = createProofReplySchema.safeParse({
      verdict: "CONFIRMED",
      body: "Looks.",
    });

    expect(result.success).toBe(false);
  });

  it("accepts short structured replies", () => {
    const result = createProofReplySchema.safeParse({
      verdict: "CONFIRMED",
      body: "I checked in person — it is open right now.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown verdicts", () => {
    const result = createProofReplySchema.safeParse({
      verdict: "PAY_NOW",
      body: "I walked past the shop today and it was open with the same sign outside.",
    });

    expect(result.success).toBe(false);
  });
});
