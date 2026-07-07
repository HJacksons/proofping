import { describe, expect, it } from "vitest";

import { mapOpenAiImproveError } from "@/lib/ai/openai-errors";

describe("mapOpenAiImproveError", () => {
  it("returns a friendly quota message for 429 errors", () => {
    expect(mapOpenAiImproveError(429)).toContain("quota");
    expect(mapOpenAiImproveError(429)).toContain("still post your question");
  });

  it("returns model guidance for 403 errors", () => {
    expect(mapOpenAiImproveError(403)).toContain("OPENAI_MODEL");
  });
});
