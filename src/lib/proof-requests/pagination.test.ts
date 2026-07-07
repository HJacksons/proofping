import { describe, expect, it } from "vitest";

import { paginateByCursor } from "@/lib/proof-requests/pagination";

describe("paginateByCursor", () => {
  it("returns all rows when under the limit", () => {
    const rows = [{ id: "a" }, { id: "b" }];

    expect(paginateByCursor(rows, 3)).toEqual({
      items: rows,
      nextCursor: null,
      hasMore: false,
    });
  });

  it("returns a cursor when more rows are available", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];

    expect(paginateByCursor(rows, 2)).toEqual({
      items: [{ id: "a" }, { id: "b" }],
      nextCursor: "b",
      hasMore: true,
    });
  });
});
