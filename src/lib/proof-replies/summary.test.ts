import { describe, expect, it } from "vitest";

import {
  buildReplySummariesByRequestId,
  summarizeProofReplies,
  summarizeProofReplyCounts,
  summarizeVerdictGroups,
} from "@/lib/proof-replies/summary";

describe("summarizeProofReplies", () => {
  it("shows waiting state with no replies", () => {
    expect(summarizeProofReplies([])).toEqual({
      total: 0,
      confirmed: 0,
      suspicious: 0,
      unsure: 0,
      resultLabel: "Waiting for replies",
    });
  });

  it("prioritizes suspicious replies in the result label", () => {
    expect(
      summarizeProofReplies([
        { verdict: "CONFIRMED" },
        { verdict: "SUSPICIOUS" },
        { verdict: "UNSURE" },
      ]),
    ).toEqual({
      total: 3,
      confirmed: 1,
      suspicious: 1,
      unsure: 1,
      resultLabel: "Be careful before you decide",
    });
  });

  it("labels a single confirmed reply as an early signal", () => {
    expect(summarizeProofReplies([{ verdict: "CONFIRMED" }])).toMatchObject({
      total: 1,
      confirmed: 1,
      suspicious: 0,
      unsure: 0,
      resultLabel: "1 early signal",
    });
  });

  it("labels multiple confirmed replies without unsure notes", () => {
    expect(
      summarizeProofReplies([{ verdict: "CONFIRMED" }, { verdict: "CONFIRMED" }]),
    ).toMatchObject({
      total: 2,
      confirmed: 2,
      suspicious: 0,
      unsure: 0,
      resultLabel: "2 people confirmed",
    });
  });
});

describe("summarizeProofReplyCounts", () => {
  it("matches summarizeProofReplies for the same counts", () => {
    expect(summarizeProofReplyCounts(1, 0, 0)).toEqual(
      summarizeProofReplies([{ verdict: "CONFIRMED" }]),
    );
  });
});

describe("summarizeVerdictGroups", () => {
  it("builds a summary from grouped counts", () => {
    expect(
      summarizeVerdictGroups([
        { verdict: "CONFIRMED", _count: { _all: 2 } },
        { verdict: "UNSURE", _count: { _all: 1 } },
      ]),
    ).toMatchObject({
      total: 3,
      confirmed: 2,
      suspicious: 0,
      unsure: 1,
      resultLabel: "Partly confirmed",
    });
  });
});

describe("buildReplySummariesByRequestId", () => {
  it("groups summaries per request", () => {
    const summaries = buildReplySummariesByRequestId([
      { requestId: "req-1", verdict: "CONFIRMED", _count: { _all: 1 } },
      { requestId: "req-2", verdict: "SUSPICIOUS", _count: { _all: 1 } },
    ]);

    expect(summaries.get("req-1")).toMatchObject({
      total: 1,
      confirmed: 1,
      resultLabel: "1 early signal",
    });
    expect(summaries.get("req-2")).toMatchObject({
      total: 1,
      suspicious: 1,
      resultLabel: "Be careful before you decide",
    });
  });
});
