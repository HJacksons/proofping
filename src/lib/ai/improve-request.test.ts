import { describe, expect, it } from "vitest";

import {
  buildImproveProofRequestPrompt,
  improveProofRequestSchema,
  parseImprovedProofRequestWording,
} from "@/lib/ai/improve-request";

describe("improveProofRequestSchema", () => {
  it("requires a title", () => {
    expect(improveProofRequestSchema.safeParse({ title: "Is this real?" }).success).toBe(
      true,
    );
  });
});

describe("buildImproveProofRequestPrompt", () => {
  it("includes the request fields in the prompt", () => {
    expect(
      buildImproveProofRequestPrompt({
        title: "Is this listing real?",
        locationHint: "Denver",
        details: "Found on Craigslist",
      }),
    ).toContain("Denver");
  });
});

describe("parseImprovedProofRequestWording", () => {
  it("parses valid JSON suggestions", () => {
    expect(
      parseImprovedProofRequestWording(
        JSON.stringify({
          title: "Is this apartment listing real?",
          details: "Please confirm the building exists before I send a deposit.",
        }),
      ),
    ).toEqual({
      title: "Is this apartment listing real?",
      details: "Please confirm the building exists before I send a deposit.",
    });
  });

  it("rejects invalid JSON", () => {
    expect(parseImprovedProofRequestWording("not json")).toBeNull();
  });
});
