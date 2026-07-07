import { describe, expect, it } from "vitest";

import { createProofRequestSchema, updateProofRequestStatusSchema } from "@/lib/proof-requests/validation";

describe("createProofRequestSchema", () => {
  it("trims and accepts a valid request", () => {
    const parsed = createProofRequestSchema.parse({
      title: "  Is this listing real?  ",
      body: "  I need a local person to confirm whether this apartment exists before I pay.  ",
      category: "APARTMENT_LISTING",
      locationHint: "  Denver, CO  ",
    });

    expect(parsed).toEqual({
      title: "Is this listing real?",
      body: "I need a local person to confirm whether this apartment exists before I pay.",
      category: "APARTMENT_LISTING",
      locationHint: "Denver, CO",
      listingUrl: null,
    });
  });

  it("accepts an optional listing URL", () => {
    const parsed = createProofRequestSchema.parse({
      title: "Is this listing real?",
      body: "I need a local person to confirm whether this apartment exists before I pay.",
      category: "APARTMENT_LISTING",
      listingUrl: "https://denver.craigslist.org/example",
    });

    expect(parsed.listingUrl).toBe("https://denver.craigslist.org/example");
  });

  it("rejects invalid listing URLs", () => {
    const result = createProofRequestSchema.safeParse({
      title: "Is this listing real?",
      body: "I need a local person to confirm whether this apartment exists before I pay.",
      category: "APARTMENT_LISTING",
      listingUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  it("rejects vague requests", () => {
    const result = createProofRequestSchema.safeParse({
      title: "Check",
      body: "Is it real?",
      category: "APARTMENT_LISTING",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown categories", () => {
    const result = createProofRequestSchema.safeParse({
      title: "Is this listing real?",
      body: "I need a local person to confirm whether this apartment exists before I pay.",
      category: "PRIVATE_PERSON_TRACKING",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateProofRequestStatusSchema", () => {
  it("accepts valid review statuses", () => {
    expect(updateProofRequestStatusSchema.parse({ status: "SOLVED" })).toEqual({
      status: "SOLVED",
    });
  });

  it("rejects unknown statuses", () => {
    const result = updateProofRequestStatusSchema.safeParse({
      status: "ARCHIVED",
    });

    expect(result.success).toBe(false);
  });
});
